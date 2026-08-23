<?php

declare(strict_types=1);

namespace App\Notifications;

use Closure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The callback that should be used to create the reset password URL.
     *
     * @var Closure|null
     */
    public static $createUrlCallback;

    /**
     * The callback that should be used to build the mail message.
     *
     * @var Closure|null
     */
    public static $toMailCallback;

    /**
     * Create a notification instance.
     */
    public function __construct(
        /**
         * The password reset token.
         */
        public string $token
    ) {}

    /**
     * Set a callback that should be used when creating the reset password button URL.
     */
    public static function createUrlUsing(Closure $callback): void
    {
        self::$createUrlCallback = $callback;
    }

    /**
     * Set a callback that should be used when building the notification mail message.
     */
    public static function toMailUsing(Closure $callback): void
    {
        self::$toMailCallback = $callback;
    }

    /**
     * Get the notification's channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->from('reset@naturalrudraksh.com', 'Natural Rudraksh')
            ->subject('Reset Your Password')
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'url' => $url,
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]);
    }

    /**
     * Get the reset password URL for the given notifiable.
     */
    protected function resetUrl(object $notifiable): string
    {
        if (self::$createUrlCallback) {
            return call_user_func(self::$createUrlCallback, $notifiable, $this->token);
        }

        return url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));
    }
}
