<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use MongoDB\Laravel\Auth\User as Authenticatable;
use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $avatar
 * @property string $role
 * @property string|null $created_by
 * @property string|null $phone
 * @property array|null $address
 * @property array|null $permissions
 * @property bool $is_active
 * @property \Carbon\Carbon|null $last_login_at
 * @property \Carbon\Carbon|null $email_verified_at
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property string|null $remember_token
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Carbon\Carbon|null $two_factor_confirmed_at
 * @property-read string $avatar_url
 * @property-read User|null $creator
 */
final class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Role constants
     */
    public const ROLE_USER = 'user';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_SUPER_ADMIN = 'super_admin';

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'created_by',
        'phone',
        'address',
        'permissions',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['avatar_url'];

    /**
     * The attributes that should have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => self::ROLE_USER,
        'is_active' => true,
    ];

    /**
     * Check if user is a regular user
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is a super admin
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user has admin privileges (admin or super_admin)
     */
    public function hasAdminAccess(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN]);
    }

    /**
     * Scope a query to only include users with a specific role
     */
    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Scope a query to only include regular users
     */
    public function scopeUsers($query)
    {
        return $query->where('role', self::ROLE_USER);
    }

    /**
     * Scope a query to only include admins
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    /**
     * Scope a query to only include super admins
     */
    public function scopeSuperAdmins($query)
    {
        return $query->where('role', self::ROLE_SUPER_ADMIN);
    }

    /**
     * Scope a query to only include active users
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the admin who created this user (for admins created by super admin)
     */
    public function creator()
    {
        return $this->belongsTo(self::class, 'created_by');
    }

    /**
     * Get all admins created by this super admin
     */
    public function createdAdmins()
    {
        return $this->hasMany(self::class, 'created_by')->where('role', self::ROLE_ADMIN);
    }

    /**
     * Get the avatar URL accessor.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('uploads/avatars/'.$this->avatar);
        }

        // Default avatars when none uploaded.
        if ($this->hasAdminAccess()) {
            return asset('assets/img/ad.webp');
        }

        return asset('assets/img/usr.webp');
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Send the password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'permissions' => 'array',
            'address' => 'array',
        ];
    }
}
