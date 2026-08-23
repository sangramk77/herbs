<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if super admin already exists
        $existingSuperAdmin = User::where('role', User::ROLE_SUPER_ADMIN)->first();

        if ($existingSuperAdmin) {
            $this->command->info('Super Admin already exists!');
            $this->command->info('Email: '.$existingSuperAdmin->email);

            return;
        }

        // Create super admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@naturalrudraksh.com',
            'password' => Hash::make('password'), // Change this in production!
            'role' => User::ROLE_SUPER_ADMIN,
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $this->command->info('Super Admin created successfully!');
        $this->command->info('Email: '.$superAdmin->email);
        $this->command->warn('Password: password (Please change this immediately!)');
    }
}
