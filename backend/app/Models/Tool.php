<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'description',
        'url',
        'github_url',
        'documentation_url',
        'thumbnail_url',
        'tool_type',
        'pricing_model',
        'status',
        'views_count',
        'favorites_count',
        'is_featured',
        'published_at',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'views_count' => 'integer',
        'favorites_count' => 'integer',
        'published_at' => 'datetime',
    ];

    /**
     * Get the user who submitted this tool
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category this tool belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all tags associated with this tool
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tool_tag')->withTimestamps();
    }

    /**
     * Get all comments for this tool
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->with('user')->latest();
    }

    /**
     * Get all favorites for this tool
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /**
     * Get all roles associated with this tool
     * Returns an array of role strings
     */
    public function roles()
    {
        return $this->hasMany(\Illuminate\Database\Eloquent\Model::class, 'tool_id', 'id')
                    ->from('tool_role')
                    ->select('role');
    }

    /**
     * Get roles as an array
     */
    public function getRolesAttribute()
    {
        return \DB::table('tool_role')
                  ->where('tool_id', $this->id)
                  ->pluck('role')
                  ->toArray();
    }

    /**
     * Sync roles for this tool
     */
    public function syncRoles(array $roles)
    {
        \DB::table('tool_role')->where('tool_id', $this->id)->delete();

        foreach ($roles as $role) {
            \DB::table('tool_role')->insert([
                'tool_id' => $this->id,
                'role' => $role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Scope to get only published tools
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->whereNotNull('published_at');
    }

    /**
     * Scope to get featured tools
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope to filter by tool type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('tool_type', $type);
    }

    /**
     * Scope to search by title or description
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to filter by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('role', $role);
        });
    }

    /**
     * Scope to filter by multiple roles (OR condition)
     */
    public function scopeByRoles($query, array $roles)
    {
        return $query->whereExists(function ($q) use ($roles) {
            $q->select(\DB::raw(1))
              ->from('tool_role')
              ->whereColumn('tool_role.tool_id', 'tools.id')
              ->whereIn('tool_role.role', $roles);
        });
    }

    /**
     * Increment views count
     */
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    /**
     * Check if tool is published
     */
    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->published_at !== null;
    }
}
