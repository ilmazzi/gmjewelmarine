<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $table = 'news';

    protected $fillable = [
        'title',
        'excerpt',
        'content',
        'cover_image',
        'is_published',
        'published_date',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_date' => 'datetime',
            'sort_order' => 'integer',
            'created_date' => 'datetime',
        ];
    }

    public function getCreatedDateAttribute()
    {
        return $this->created_at;
    }
}
