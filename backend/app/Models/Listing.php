<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    protected $fillable = [
        'title',
        'section',
        'brand_id',
        'brand',
        'model',
        'category_id',
        'condition',
        'price',
        'price_on_request',
        'short_description',
        'description',
        'images',
        'featured_image',
        'is_promoted',
        'is_published',
        'specs',
        'year',
        'length_m',
        'engine_hp',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'brand_id' => 'integer',
            'category_id' => 'integer',
            'price' => 'float',
            'price_on_request' => 'boolean',
            'images' => 'array',
            'is_promoted' => 'boolean',
            'is_published' => 'boolean',
            'specs' => 'array',
            'year' => 'integer',
            'length_m' => 'float',
            'engine_hp' => 'integer',
            'sort_order' => 'integer',
            'created_date' => 'datetime',
        ];
    }

    public function getCreatedDateAttribute()
    {
        return $this->created_at;
    }
}
