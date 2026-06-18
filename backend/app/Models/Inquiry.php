<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'listing_id',
        'listing_title',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'listing_id' => 'integer',
            'is_read' => 'boolean',
            'created_date' => 'datetime',
        ];
    }

    public function getCreatedDateAttribute()
    {
        return $this->created_at;
    }
}
