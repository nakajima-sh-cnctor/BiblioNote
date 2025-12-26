/**
 * @fileoverview useAuth Composable テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、認証機能を提供する `useAuth` composable の設計仕様と動作を定義します。
 * 
 * ## 対象機能
 * - ユーザーログイン (Email/Password認証)
 * - ユーザー登録 (Email/Password認証)
 * - パスワードリセット (メール送信)
 * 
 * ## アーキテクチャ
 * - **レイヤー**: Presentation Layer (Composable)
 * - **依存関係**: Firebase Authentication
 * - **状態管理**: Vue 3 Composition API (ref)
 * 
 * ## 状態仕様
 * - `error`: エラーメッセージを保持する reactive な状態
 * - `isLoading`: 処理中かどうかを示す reactive な状態
 * 
 * ## エラーハンドリング仕様
 * - すべての認証操作でエラーが発生した場合、`error` 状態にエラーメッセージを設定
 * - エラー発生時も `isLoading` を false に戻す
 * - エラーは呼び出し元に再スローされる
 * 
 * ## テスト戦略
 * - Firebase Authentication の関数をモック化してユニットテストを実施
 * - 正常系と異常系の両方をカバー
 * - 状態の変化を検証
 * 
 * @module features/auth/composables/useAuth.spec
 * @requires vitest
 * @requires firebase/auth
 */

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

/**
 * @description useAuth Composable のメインテストスイート
 * 
 * ## テスト対象
 * useAuth composable が提供する以下の機能:
 * - login(): メール/パスワードでのログイン
 * - signup(): メール/パスワードでの新規登録
 * - resetPassword(): パスワードリセットメール送信
 * - error: エラー状態の管理
 * - isLoading: ローディング状態の管理
 */
describe('useAuth', () => {
    const { login, signup, error, isLoading } = useAuth();

    beforeEach(() => {
        // 各テストの前に状態とモックをリセット
        error.value = null;
        isLoading.value = false;
        vi.clearAllMocks();
    });

    /**
     * @description ログイン機能の仕様
     * 
     * ## 機能要件
     * - メールアドレスとパスワードを受け取り、Firebase Authentication でログインを実行
     * - 成功時はユーザーオブジェクトを返す
     * - 失敗時はエラーを適切に処理し、状態を更新
     * 
     * ## 状態管理
     * - 処理中: `isLoading` を true に設定
     * - 成功時: `isLoading` を false、`error` を null に設定
     * - 失敗時: `isLoading` を false、`error` にエラーメッセージを設定
     */
    describe('login (ログイン)', () => {
        /**
         * @test ログイン成功シナリオ
         * 
         * ## 検証項目
         * 1. Firebase の signInWithEmailAndPassword が正しいパラメータで呼ばれること
         * 2. 処理完了後、isLoading が false になること
         * 3. エラーが発生しないこと (error が null)
         * 4. 返り値がユーザーオブジェクトであること
         * 
         * ## 期待される動作
         * - 入力: 有効なメールアドレスとパスワード
         * - 出力: ユーザーオブジェクト { uid, email }
         */
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

        /**
         * @test ログイン失敗シナリオ
         * 
         * ## 検証項目
         * 1. Firebase でエラーが発生した場合、エラーが再スローされること
         * 2. error 状態にエラーメッセージが設定されること
         * 3. isLoading が false に戻ること
         * 
         * ## 期待される動作
         * - 入力: 無効な認証情報
         * - 出力: エラーがスローされ、error 状態が更新される
         * 
         * ## エラーハンドリング
         * - Firebase のエラーメッセージをそのまま error 状態に設定
         * - 呼び出し元にエラーを再スローして、上位レイヤーでの処理を可能にする
         */
        it('ログインエラーを処理できること', async () => {
            const mockError = new Error('Invalid credentials');
            signInWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe('Invalid credentials');
        });
    });

    /**
     * @description サインアップ(新規登録)機能の仕様
     * 
     * ## 機能要件
     * - メールアドレスとパスワードを受け取り、Firebase Authentication で新規ユーザーを作成
     * - 成功時はユーザーオブジェクトを返す
     * - 失敗時はエラーを適切に処理し、状態を更新
     * 
     * ## 状態管理
     * - 処理中: `isLoading` を true に設定
     * - 成功時: `isLoading` を false、`error` を null に設定
     * - 失敗時: `isLoading` を false、`error` にエラーメッセージを設定
     */
    describe('signup (サインアップ)', () => {
        /**
         * @test サインアップ成功シナリオ
         * 
         * ## 検証項目
         * 1. Firebase の createUserWithEmailAndPassword が正しいパラメータで呼ばれること
         * 2. 処理完了後、isLoading が false になること
         * 3. エラーが発生しないこと (error が null)
         * 4. 返り値が新規作成されたユーザーオブジェクトであること
         * 
         * ## 期待される動作
         * - 入力: 新規のメールアドレスとパスワード
         * - 出力: 新規ユーザーオブジェクト { uid, email }
         */
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

        /**
         * @test サインアップ失敗シナリオ
         * 
         * ## 検証項目
         * 1. Firebase でエラーが発生した場合、エラーが再スローされること
         * 2. error 状態にエラーメッセージが設定されること
         * 3. isLoading が false に戻ること
         * 
         * ## 期待される動作
         * - 入力: 既に使用されているメールアドレス等
         * - 出力: エラーがスローされ、error 状態が更新される
         * 
         * ## 一般的なエラーケース
         * - メールアドレスが既に使用されている
         * - パスワードが弱すぎる
         * - メールアドレスの形式が不正
         */
        it('サインアップエラーを処理できること', async () => {
            const mockError = new Error('Email already in use');
            createUserWithEmailAndPassword.mockRejectedValue(mockError);

            await expect(signup('new@example.com', 'password123')).rejects.toThrow('Email already in use');

            expect(isLoading.value).toBe(false);
            expect(error.value).toBe('Email already in use');
        });

        /**
         * @description パスワードリセット機能の仕様
         * 
         * ## 機能要件
         * - メールアドレスを受け取り、Firebase Authentication でパスワードリセットメールを送信
         * - 成功時は正常に完了
         * - 失敗時はエラーを適切に処理し、状態を更新
         * 
         * ## 状態管理
         * - 処理中: `isLoading` を true に設定
         * - 成功時: `isLoading` を false、`error` を null に設定
         * - 失敗時: `isLoading` を false、`error` にエラーメッセージを設定
         * 
         * ## セキュリティ考慮事項
         * - 存在しないメールアドレスでもエラーを返さない(セキュリティ上の理由)
         * - ただし、Firebase 側で適切にハンドリングされる
         */
        describe('resetPassword (パスワードリセット)', () => {
            /**
             * @test パスワードリセットメール送信成功シナリオ
             * 
             * ## 検証項目
             * 1. Firebase の sendPasswordResetEmail が正しいパラメータで呼ばれること
             * 2. 処理完了後、isLoading が false になること
             * 3. エラーが発生しないこと (error が null)
             * 
             * ## 期待される動作
             * - 入力: 登録済みのメールアドレス
             * - 出力: メール送信が成功し、エラーが発生しない
             */
            it('パスワードリセットメールを送信できること', async () => {
                const { resetPassword } = useAuth();
                sendPasswordResetEmail.mockResolvedValue();

                await resetPassword('reset@example.com');

                expect(isLoading.value).toBe(false);
                expect(error.value).toBe(null);
                expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'reset@example.com');
            });

            /**
             * @test パスワードリセット失敗シナリオ
             * 
             * ## 検証項目
             * 1. Firebase でエラーが発生した場合、エラーが再スローされること
             * 2. error 状態にエラーメッセージが設定されること
             * 3. isLoading が false に戻ること
             * 
             * ## 期待される動作
             * - 入力: 存在しないユーザーのメールアドレス等
             * - 出力: エラーがスローされ、error 状態が更新される
             * 
             * ## 一般的なエラーケース
             * - ユーザーが見つからない
             * - メールアドレスの形式が不正
             * - ネットワークエラー
             */
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
