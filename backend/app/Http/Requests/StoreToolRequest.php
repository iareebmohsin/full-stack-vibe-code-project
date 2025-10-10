<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // All authenticated users can submit tools
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic info
            'title' => [
                'required',
                'string',
                'min:3',
                'max:255',
                Rule::unique('tools', 'title'),
            ],
            'description' => [
                'required',
                'string',
                'min:20',
                'max:2000',
            ],
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where('is_active', true),
            ],

            // URLs
            'url' => [
                'nullable',
                'url:http,https',
                'max:500',
            ],
            'github_url' => [
                'nullable',
                'url:http,https',
                'max:500',
                'regex:/^https?:\/\/(www\.)?github\.com\/.*$/',
            ],
            'documentation_url' => [
                'nullable',
                'url:http,https',
                'max:500',
            ],
            'thumbnail_url' => [
                'nullable',
                'url:http,https',
                'max:500',
            ],

            // Enums
            'tool_type' => [
                'required',
                Rule::in(['library', 'framework', 'api', 'service', 'application']),
            ],
            'pricing_model' => [
                'required',
                Rule::in(['free', 'freemium', 'paid', 'open_source']),
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'published']),
            ],

            // Tags
            'tags' => [
                'required',
                'array',
                'min:1',
                'max:10',
            ],
            'tags.*' => [
                'integer',
                'min:1',
            ],

            // Roles
            'roles' => [
                'required',
                'array',
                'min:1',
            ],
            'roles.*' => [
                'string',
                Rule::in(['owner', 'backend', 'frontend', 'designer', 'devops', 'data-scientist', 'qa']),
            ],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a title for the tool.',
            'title.unique' => 'A tool with this title already exists.',
            'title.min' => 'The title must be at least 3 characters.',
            'description.required' => 'Please provide a description for the tool.',
            'description.min' => 'The description must be at least 20 characters.',
            'description.max' => 'The description cannot exceed 2000 characters.',
            'category_id.required' => 'Please select a category.',
            'category_id.exists' => 'The selected category is invalid or inactive.',
            'url.url' => 'Please provide a valid URL.',
            'github_url.regex' => 'Please provide a valid GitHub repository URL.',
            'tool_type.required' => 'Please select a tool type.',
            'pricing_model.required' => 'Please select a pricing model.',
            'tags.required' => 'Please add at least one tag.',
            'tags.min' => 'Please add at least one tag.',
            'tags.max' => 'You can add a maximum of 10 tags.',
            'tags.*.exists' => 'One or more selected tags are invalid.',
            'roles.required' => 'Please select at least one role.',
            'roles.min' => 'Please select at least one role.',
            'roles.*.in' => 'One or more selected roles are invalid.',
        ];
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            'category_id' => 'category',
            'tool_type' => 'tool type',
            'pricing_model' => 'pricing model',
            'github_url' => 'GitHub URL',
            'documentation_url' => 'documentation URL',
            'thumbnail_url' => 'thumbnail URL',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate slug from title
        if ($this->has('title') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->title),
            ]);
        }

        // Set user_id to authenticated user
        $this->merge([
            'user_id' => auth()->id(),
        ]);

        // Set published_at if status is published
        if ($this->status === 'published' && !$this->has('published_at')) {
            $this->merge([
                'published_at' => now(),
            ]);
        }
    }

    /**
     * Custom validation after standard rules pass
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate tags exist in a single query
            if ($this->has('tags') && is_array($this->tags)) {
                $tagIds = $this->tags;
                $existingTagsCount = \DB::table('tags')
                    ->whereIn('id', $tagIds)
                    ->count();

                if ($existingTagsCount !== count($tagIds)) {
                    $validator->errors()->add('tags', 'One or more selected tags are invalid.');
                }
            }
        });
    }
}
