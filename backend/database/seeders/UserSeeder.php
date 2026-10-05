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
                'name' => 'Areeb',
                'email' => 'areebmhsn@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Maya Chen',
                'email' => 'maya@loadout.test',
                'password' => Hash::make('password'),
                'role' => 'frontend',
            ],
            [
                'name' => 'Omar Haddad',
                'email' => 'omar@loadout.test',
                'password' => Hash::make('password'),
                'role' => 'backend',
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('Sample users created successfully!');
        $this->command->info('You can now login with:');
        $this->command->info('  - areebmhsn@gmail.com / password (Owner)');
        $this->command->info('  - maya@loadout.test / password (Frontend)');
        $this->command->info('  - omar@loadout.test / password (Backend)');
    }
}
