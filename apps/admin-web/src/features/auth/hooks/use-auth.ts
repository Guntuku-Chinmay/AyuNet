import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../../../stores/use-auth-store';
import { ROLE_DEFAULT_ROUTES } from '../../../constants/permissions';
import { LoginSchemaInput, ForgotPasswordSchemaInput, ResetPasswordSchemaInput, ChangePasswordSchemaInput, OtpSchemaInput } from '../schemas/auth-schemas';

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth, user, isAuthenticated, hasPermission, hasRole } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginSchemaInput) => authService.login(data),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken, res.refreshToken, res.tenantId);

      if (res.requiresPasswordChange) {
        router.push('/change-password');
        return;
      }

      if (res.requiresOtp) {
        router.push('/verify-otp');
        return;
      }

      const defaultRoute = ROLE_DEFAULT_ROUTES[res.user.role] || '/';
      router.push(defaultRoute);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      router.push('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordSchemaInput) => authService.forgotPassword(data.email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordSchemaInput) => authService.resetPassword({ token: data.token, password: data.password }),
    onSuccess: () => {
      router.push('/login?resetSuccess=true');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordSchemaInput) =>
      authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => {
      const defaultRoute = user?.role ? ROLE_DEFAULT_ROUTES[user.role] : '/login';
      router.push(defaultRoute);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: OtpSchemaInput) => authService.verifyOtp(data.code),
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken, res.refreshToken, res.tenantId);
      const defaultRoute = ROLE_DEFAULT_ROUTES[res.user.role] || '/';
      router.push(defaultRoute);
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSubmittingForgot: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    hasPermission,
    hasRole,
  };
}
