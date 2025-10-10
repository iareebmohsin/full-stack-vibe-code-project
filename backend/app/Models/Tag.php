<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    /**
     * Get all tools tagged with this tag
     */
    public function tools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, 'tool_tag')->withTimestamps();
    }

    /**
     * Increment usage count
     */
    public function incrementUsage()
    {
        $this->increment('usage_count');
    }

    /**
     * Decrement usage count
     */
    public function decrementUsage()
    {
        $this->decrement('usage_count');
    }

    /**
     * Scope to get popular tags
     */
    public function scopePopular($query, $limit = 10)
    {
        return $query->orderBy('usage_count', 'desc')->limit($limit);
    }
}
