<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoatModel extends Model
{
    protected $table = 'models';

    protected $fillable = ['brand_id', 'name', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return [
            'brand_id' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }
}
