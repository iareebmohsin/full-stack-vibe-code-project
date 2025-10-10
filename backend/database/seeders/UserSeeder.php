<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing users
        User::truncate();

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create sample users
        $users = [
            [
                'name' => 'Ivan Ivanov',
                'email' => 'ivan@admin.local',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Elena Petrova',
                'email' => 'elena@frontend.local',
                'password' => Hash::make('password'),
                'role' => 'frontend',
            ],
            [
                'name' => 'Petar Georgiev',
                'email' => 'petar@backend.local',
                'password' => Hash::make('password'),
                'role' => 'backend',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('Sample users created successfully!');
        $this->command->info('You can now login with:');
        $this->command->info('  - ivan@admin.local / password (Owner)');
        $this->command->info('  - elena@frontend.local / password (Frontend)');
        $this->command->info('  - petar@backend.local / password (Backend)');
    }
}
