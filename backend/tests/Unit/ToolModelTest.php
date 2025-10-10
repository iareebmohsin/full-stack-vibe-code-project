<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Tag;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToolModelTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function tool_belongs_to_user()
    {
        // Arrange
        $user = User::factory()->create();
        $tool = Tool::factory()->create(['user_id' => $user->id]);

        // Act & Assert
        $this->assertInstanceOf(User::class, $tool->user);
        $this->assertEquals($user->id, $tool->user->id);
    }

    /** @test */
    public function tool_belongs_to_category()
    {
        // Arrange
        $category = Category::factory()->create();
        $tool = Tool::factory()->create(['category_id' => $category->id]);

        // Act & Assert
        $this->assertInstanceOf(Category::class, $tool->category);
        $this->assertEquals($category->id, $tool->category->id);
    }

    /** @test */
    public function tool_belongs_to_many_tags()
    {
        // Arrange
        $tool = Tool::factory()->create();
        $tags = Tag::factory()->count(3)->create();
        $tool->tags()->attach($tags);

        // Act & Assert
        $this->assertCount(3, $tool->tags);
        $this->assertInstanceOf(Tag::class, $tool->tags->first());
    }

    /** @test */
    public function tool_can_have_roles_synced()
    {
        // Arrange
        $tool = Tool::factory()->create();

        // Act
        $tool->syncRoles(['backend', 'frontend', 'designer']);

        // Assert
        $roles = $tool->roles;
        $this->assertCount(3, $roles);
        $this->assertContains('backend', $roles);
        $this->assertContains('frontend', $roles);
        $this->assertContains('designer', $roles);
    }

    /** @test */
    public function tool_increment_views_increases_count()
    {
        // Arrange
        $tool = Tool::factory()->create(['views_count' => 10]);

        // Act
        $tool->incrementViews();

        // Assert
        $this->assertEquals(11, $tool->fresh()->views_count);
    }

    /** @test */
    public function tool_is_published_when_status_is_published_and_has_published_at()
    {
        // Arrange
        $tool = Tool::factory()->create([
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Act & Assert
        $this->assertTrue($tool->isPublished());
    }

    /** @test */
    public function published_scope_filters_only_published_tools()
    {
        // Arrange
        Tool::factory()->count(3)->create(['status' => 'published', 'published_at' => now()]);
        Tool::factory()->count(2)->draft()->create();

        // Act
        $publishedTools = Tool::published()->get();

        // Assert
        $this->assertCount(3, $publishedTools);
    }

    /** @test */
    public function search_scope_filters_by_title_or_description()
    {
        // Arrange
        Tool::factory()->create(['title' => 'ChatGPT Tool', 'description' => 'AI assistant']);
        Tool::factory()->create(['title' => 'Image Generator', 'description' => 'Contains ChatGPT API']);
        Tool::factory()->create(['title' => 'Unrelated Tool', 'description' => 'Nothing special']);

        // Act
        $results = Tool::search('ChatGPT')->get();

        // Assert
        $this->assertCount(2, $results);
    }
}
