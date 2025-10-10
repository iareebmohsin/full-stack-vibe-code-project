<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only owners can create categories
        return auth()->check() && auth()->user()->role === 'owner';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                Rule::unique('categories', 'name'),
            ],
            'description' => [
                'nullable',
                'string',
                'max:500',
            ],
            'icon' => [
                'nullable',
                'string',
                'max:10',
                'regex:/^[\x{1F300}-\x{1F9FF}]$/u', // Emoji validation
            ],
            'color' => [
                'nullable',
                'string',
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', // Hex color validation
            ],
            'order' => [
                'nullable',
                'integer',
                'min:0',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a category name.',
            'name.unique' => 'A category with this name already exists.',
            'icon.regex' => 'Please provide a valid emoji icon.',
            'color.regex' => 'Please provide a valid hex color code (e.g., #3B82F6).',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Auto-generate slug from name
        if ($this->has('name') && !$this->has('slug')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->name),
            ]);
        }

        // Set default color if not provided
        if (!$this->has('color')) {
            $this->merge([
                'color' => '#3B82F6',
            ]);
        }
    }
}
