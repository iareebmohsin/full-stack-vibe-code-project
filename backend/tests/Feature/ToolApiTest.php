<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function guest_can_view_published_tools_list()
    {
        // Arrange
        Tool::factory()->count(5)->create();

        // Act
        $response = $this->getJson('/api/tools');

        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'description',
                            'url',
                            'category',
                            'tags',
                            'roles_list',
                        ],
                    ],
                ],
            ]);
    }

    /** @test */
    public function authenticated_user_can_submit_new_tool()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $tags = Tag::factory()->count(3)->create();

        $toolData = [
            'title' => 'Test AI Tool',
            'description' => 'This is a test AI tool with sufficient description length to pass validation',
            'category_id' => $category->id,
            'url' => 'https://example.com',
            'tool_type' => 'service',
            'pricing_model' => 'free',
            'tags' => $tags->pluck('id')->toArray(),
            'roles' => ['backend', 'frontend'],
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Tool created successfully',
            ])
            ->assertJsonPath('data.title', 'Test AI Tool');

        // Verify database
        $this->assertDatabaseHas('tools', [
            'title' => 'Test AI Tool',
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        // Verify relationships
        $tool = Tool::where('title', 'Test AI Tool')->first();
        $this->assertCount(3, $tool->tags);
        $this->assertCount(2, $tool->roles);
    }

    /** @test */
    public function unauthenticated_user_cannot_submit_tool()
    {
        // Arrange
        $toolData = [
            'title' => 'Test Tool',
            'description' => 'Test description with enough characters',
        ];

        // Act
        $response = $this->postJson('/api/tools', $toolData);

        // Assert
        $response->assertStatus(401);
    }

    /** @test */
    public function tool_submission_requires_valid_data()
    {
        // Arrange
        $user = User::factory()->create();

        $invalidData = [
            'title' => 'AB', // Too short
            'description' => 'Short', // Too short
            'category_id' => 999, // Non-existent
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $invalidData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description', 'category_id', 'tool_type', 'pricing_model', 'tags', 'roles']);
    }

    /** @test */
    public function tool_submission_requires_at_least_one_tag()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();

        $toolData = [
            'title' => 'Test Tool',
            'description' => 'Test description with enough characters for validation',
            'category_id' => $category->id,
            'tool_type' => 'service',
            'pricing_model' => 'free',
            'tags' => [], // Empty tags
            'roles' => ['backend'],
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tags']);
    }

    /** @test */
    public function tool_submission_requires_at_least_one_role()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $tags = Tag::factory()->count(2)->create();

        $toolData = [
            'title' => 'Test Tool',
            'description' => 'Test description with enough characters for validation',
            'category_id' => $category->id,
            'tool_type' => 'service',
            'pricing_model' => 'free',
            'tags' => $tags->pluck('id')->toArray(),
            'roles' => [], // Empty roles
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['roles']);
    }

    /** @test */
    public function tool_can_be_filtered_by_category()
    {
        // Arrange
        $category1 = Category::factory()->create();
        $category2 = Category::factory()->create();

        Tool::factory()->count(3)->create(['category_id' => $category1->id]);
        Tool::factory()->count(2)->create(['category_id' => $category2->id]);

        // Act
        $response = $this->getJson("/api/tools?category_id={$category1->id}");

        // Assert
        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data.data'));
    }

    /** @test */
    public function tool_can_be_filtered_by_role()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $tags = Tag::factory()->count(2)->create();

        // Create tool for backend
        $backendTool = Tool::factory()->create(['category_id' => $category->id]);
        $backendTool->tags()->attach($tags);
        $backendTool->syncRoles(['backend']);

        // Create tool for frontend
        $frontendTool = Tool::factory()->create(['category_id' => $category->id]);
        $frontendTool->tags()->attach($tags);
        $frontendTool->syncRoles(['frontend']);

        // Act
        $response = $this->getJson('/api/tools?role=backend');

        // Assert
        $response->assertStatus(200);
        $tools = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($tools));
    }

    /** @test */
    public function tool_can_be_searched_by_name()
    {
        // Arrange
        Tool::factory()->create(['title' => 'ChatGPT AI Tool']);
        Tool::factory()->create(['title' => 'Midjourney Image Generator']);

        // Act
        $response = $this->getJson('/api/tools?search=ChatGPT');

        // Assert
        $response->assertStatus(200);
        $tools = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($tools));
        $this->assertStringContainsString('ChatGPT', $tools[0]['title']);
    }

    /** @test */
    public function user_can_view_single_tool_detail()
    {
        // Arrange
        $tool = Tool::factory()->create();
        $initialViews = $tool->views_count;

        // Act
        $response = $this->getJson("/api/tools/{$tool->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonPath('data.id', $tool->id)
            ->assertJsonPath('data.title', $tool->title);

        // Verify views incremented
        $this->assertEquals($initialViews + 1, $tool->fresh()->views_count);
    }

    /** @test */
    public function user_can_update_their_own_tool()
    {
        // Arrange
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $user->id]);
        $tags = Tag::factory()->count(2)->create();

        $updateData = [
            'title' => 'Updated Tool Title',
            'description' => 'Updated description with enough characters for validation',
            'tags' => $tags->pluck('id')->toArray(),
            'roles' => ['designer'],
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/tools/{$tool->id}", $updateData);

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Tool updated successfully',
            ]);

        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'title' => 'Updated Tool Title',
        ]);
    }

    /** @test */
    public function user_cannot_update_another_users_tool()
    {
        // Arrange
        $user1 = User::factory()->create();
        $user2 = User::factory()->create(['role' => 'frontend']); // Not owner
        $tool = Tool::factory()->create(['user_id' => $user1->id]);

        $updateData = [
            'title' => 'Hacked Title',
        ];

        // Act
        $response = $this->actingAs($user2, 'sanctum')
            ->putJson("/api/tools/{$tool->id}", $updateData);

        // Assert
        $response->assertStatus(403);
    }

    /** @test */
    public function owner_can_update_any_tool()
    {
        // Arrange
        $owner = User::factory()->create(['role' => 'owner']);
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $user->id]);

        $updateData = [
            'title' => 'Owner Updated Title',
            'description' => 'Owner updated description with sufficient length',
        ];

        // Act
        $response = $this->actingAs($owner, 'sanctum')
            ->putJson("/api/tools/{$tool->id}", $updateData);

        // Assert
        $response->assertStatus(200);
        $this->assertDatabaseHas('tools', [
            'id' => $tool->id,
            'title' => 'Owner Updated Title',
        ]);
    }

    /** @test */
    public function user_can_delete_their_own_tool()
    {
        // Arrange
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $user->id]);

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/tools/{$tool->id}");

        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Tool deleted successfully',
            ]);

        $this->assertDatabaseMissing('tools', [
            'id' => $tool->id,
        ]);
    }

    /** @test */
    public function tool_title_must_be_unique()
    {
        // Arrange
        $user = User::factory()->create();
        $category = Category::factory()->create();
        $tags = Tag::factory()->count(2)->create();

        Tool::factory()->create(['title' => 'Existing Tool']);

        $toolData = [
            'title' => 'Existing Tool', // Duplicate
            'description' => 'Test description with enough characters',
            'category_id' => $category->id,
            'tool_type' => 'service',
            'pricing_model' => 'free',
            'tags' => $tags->pluck('id')->toArray(),
            'roles' => ['backend'],
        ];

        // Act
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tools', $toolData);

        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title']);
    }

    /** @test */
    public function draft_tools_are_not_shown_in_public_list()
    {
        // Arrange
        Tool::factory()->count(3)->create(['status' => 'published']);
        Tool::factory()->count(2)->draft()->create();

        // Act
        $response = $this->getJson('/api/tools');

        // Assert
        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data.data'));
    }

    /** @test */
    public function tool_can_be_filtered_by_tags()
    {
        // Arrange
        $tag1 = Tag::factory()->create(['name' => 'Machine Learning']);
        $tag2 = Tag::factory()->create(['name' => 'Python']);

        $tool1 = Tool::factory()->create();
        $tool1->tags()->attach($tag1);

        $tool2 = Tool::factory()->create();
        $tool2->tags()->attach($tag2);

        // Act
        $response = $this->getJson("/api/tools?tag={$tag1->id}");

        // Assert
        $response->assertStatus(200);
        $tools = $response->json('data.data');
        $this->assertGreaterThanOrEqual(1, count($tools));
    }
}
