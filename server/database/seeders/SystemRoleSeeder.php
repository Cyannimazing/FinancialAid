<?php

namespace Database\Seeders;

use App\Models\SystemRole;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = ['admin', 'director', 'employee', 'beneficiary'];
        
        foreach ($roles as $role) {
            SystemRole::firstOrCreate(['name' => $role]);
        }
    }
}
