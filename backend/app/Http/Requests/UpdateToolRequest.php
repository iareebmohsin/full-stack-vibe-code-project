<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateToolRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        // User can update their own tool, or owners can update any tool
        return auth()->check() &&
               (auth()->id() === $tool->user_id || auth()->user()->role === 'owner');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $toolId = $this->route('tool')->id;

        return [
            // Basic info
            'title' => [
                'sometimes',
                'string',
                'min:3',
                'max:255',
                Rule::unique('tools', 'title')->ignore($toolId),
            ],
            'description' => [
                'sometimes',
                'string',
                'min:20',
                'max:2000',
            ],
            'category_id' => [
                'sometimes',
                'integer',
                Rule::exists('categories', 'id')->where('is_active', true),
            ],

            // URLs
            'url' => [
                'nullable',
                'url:http,https',
                'max:500',
                'active_url',
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
                'sometimes',
                Rule::in(['library', 'framework', 'api', 'service', 'application']),
            ],
            'pricing_model' => [
                'sometimes',
                Rule::in(['free', 'freemium', 'paid', 'open_source']),
            ],
            'status' => [
                'sometimes',
                Rule::in(['draft', 'published', 'archived']),
            ],

            // Tags
            'tags' => [
                'sometimes',
                'array',
                'min:1',
                'max:10',
            ],
            'tags.*' => [
                'integer',
                Rule::exists('tags', 'id'),
            ],

            // Featured flag (only owners can set)
            'is_featured' => [
                'sometimes',
                'boolean',
                Rule::when(auth()->user()->role !== 'owner', ['prohibited']),
            ],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'title.unique' => 'A tool with this title already exists.',
            'title.min' => 'The title must be at least 3 characters.',
            'description.min' => 'The description must be at least 20 characters.',
            'description.max' => 'The description cannot exceed 2000 characters.',
            'category_id.exists' => 'The selected category is invalid or inactive.',
            'url.active_url' => 'The URL must be a valid, reachable website.',
            'github_url.regex' => 'Please provide a valid GitHub repository URL.',
            'tags.min' => 'Please add at least one tag.',
            'tags.max' => 'You can add a maximum of 10 tags.',
            'tags.*.exists' => 'One or more selected tags are invalid.',
            'is_featured.prohibited' => 'Only owners can feature tools.',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate slug from title if title is being updated
        if ($this->has('title') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->title),
            ]);
        }

        // Set published_at if status is changing to published
        if ($this->status === 'published' && $this->route('tool')->status !== 'published') {
            $this->merge([
                'published_at' => now(),
            ]);
        }
    }
}
