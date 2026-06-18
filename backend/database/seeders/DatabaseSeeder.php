<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@gmjewelmarine.local'],
            [
                'name' => 'GM Jewel Marine Admin',
                'password' => Hash::make('ChangeMe123!'),
                'role' => 'admin',
                'api_token' => hash('sha256', Str::random(80)),
            ],
        );

        $settings = [
            ['key' => 'company_name', 'value' => 'GM Jewel Marine', 'group' => 'company'],
            ['key' => 'logo_url', 'value' => '/gm-jewel-marine-logo.png', 'group' => 'brand'],
            ['key' => 'footer_tagline', 'value' => 'Specialisti nella vendita di barche, gommoni, motori e carrelli. Nuovo e usato selezionato.', 'group' => 'brand'],
            ['key' => 'hero_tag', 'value' => 'Specialisti nautici dal 2000', 'group' => 'home'],
            ['key' => 'hero_subtitle', 'value' => 'Barche, gommoni, motori e carrelli. Nuovo e usato selezionato dai migliori venditori.', 'group' => 'home'],
            ['key' => 'sections_order', 'value' => 'barche,gommoni,motori,carrelli,usato', 'group' => 'navigation'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
