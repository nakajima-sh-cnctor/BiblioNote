import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAuth from './useAuth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// 認証関数のモック
vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    getAuth: vi.fn(), // useAuthが 'auth' を直接インポートしている場合でも、必要に応じてモック化します。
    // useAuthは '../../../firebase' から { auth } をインポートしているので、そのモジュールがauthインスタンスをエクスポートしていると仮定します。
    // useAuthのユニットテストでは、主にメソッドが呼び出されることを確認します。
}));

// 実際のアプリを初期化しないようにfirebase設定ファイルをモック化
vi.mock('../../../firebase', () => ({
    auth: {}
}));

describe('useAuth', () => {
    const { login, signup, error, isLoading } = useAuth();

    beforeEach(() => {
        // 各テストの前に状態とモックをリセット
        error.value = null;
        isLoading.value = false;
        vi.clearAllMocks();
    });

    describe('login (ログイン)', () => {
        it('ユーザーが正常にログインできること', async () => {
            const mockUser = { uid: '123', email: 'test@example.com' };
            const mockCredential = { user: mockUser };
            signInWithEmailAndPassword.mockResolvedValue(mockCredential);

            const result = await login('test@example.com', 'password123');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(result).toEqual(mockUser);
            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
        });

        it('ログインエラーを処理できること', async () => {
            const mockError = new Error('Invalid credentials');
            signInWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe('Invalid credentials');
        });
    });

    describe('signup (サインアップ)', () => {
        it('ユーザーが正常にサインアップできること', async () => {
            const mockUser = { uid: '456', email: 'new@example.com' };
            const mockCredential = { user: mockUser };
            createUserWithEmailAndPassword.mockResolvedValue(mockCredential);

            const result = await signup('new@example.com', 'password123');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe(null);
            expect(result).toEqual(mockUser);
            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@example.com', 'password123');
        });

        it('サインアップエラーを処理できること', async () => {
            const mockError = new Error('Email already in use');
            createUserWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(signup('new@example.com', 'password123')).rejects.toThrow('Email already in use');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe('Email already in use');
        });

        describe('resetPassword (パスワードリセット)', () => {
            it('パスワードリセットメールを送信できること', async () => {
                const { resetPassword } = useAuth();
                sendPasswordResetEmail.mockResolvedValue();

                await resetPassword('reset@example.com');

                expect(isLoading.value).toBe(false);
                expect(error.value).toBe(null);
                expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'reset@example.com');
            });

            it('パスワードリセットエラーを処理できること', async () => {
                const { resetPassword } = useAuth(); // Re-destructure specifically for this test context if needed, though closure captures it.
                const mockError = new Error('User not found');
                sendPasswordResetEmail.mockRejectedValue(mockError);

                await expect(resetPassword('reset@example.com')).rejects.toThrow('User not found');

                expect(isLoading.value).toBe(false);
                expect(error.value).toBe('User not found');
            });
        });
    });
});
