/**
 * @fileoverview Note Entity テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、ノート機能のコアドメインオブジェクトである `Note` エンティティの
 * 設計仕様と振る舞いを定義します。
 * 
 * ## 対象機能
 * - エンティティの生成 (Constructor)
 * - バリデーションロジック (Validation)
 * - データ変換 (To/From Firestore)
 * 
 * ## データ構造仕様
 * - id: ノートID (文字列, 任意)
 * - userId: ユーザーID (文字列, 必須)
 * - title: タイトル (文字列, 必須, 最大100文字)
 * - content: 本文 (文字列, 任意)
 * - tags: タグ (配列, 任意)
 * - createdAt: 作成日時 (ISO文字列)
 * - updatedAt: 更新日時 (ISO文字列)
 * 
 * @module features/notes/domain/entities/Note.test
 * @requires vitest
 */

import { describe, it, expect } from 'vitest';
import { Note } from '../Note';

describe('Note Entity', () => {
    /**
     * @description コンストラクタの仕様
     * 
     * ## 機能要件
     * - オブジェクトから Note エンティティを生成する
     * - 必須フィールド以外はデフォルト値が設定されること
     */
    describe('constructor', () => {
        /**
         * @test 全フィールド指定での生成
         * 
         * ## 検証項目
         * 1. 渡された全プロパティが正しく設定されること
         * 
         * ## 期待される動作
         * - 入力: 全フィールドを含むオブジェクト
         * - 出力: 入力値と同じプロパティを持つインスタンス
         */
        it('should create a note with all fields', () => {
            const noteData = {
                id: 'note123',
                userId: 'user123',
                title: 'Test Note',
                content: '# Content',
                tags: ['tag1', 'tag2'],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            };

            const note = new Note(noteData);

            expect(note.id).toBe('note123');
            expect(note.userId).toBe('user123');
            expect(note.title).toBe('Test Note');
            expect(note.content).toBe('# Content');
            expect(note.tags).toEqual(['tag1', 'tag2']);
            expect(note.createdAt).toBe('2024-01-01T00:00:00.000Z');
            expect(note.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });

        /**
         * @test デフォルト値の適用
         * 
         * ## 検証項目
         * 1. content が未指定の場合、空文字になること
         * 2. createdAt が未指定の場合、値が設定されること (現在時刻)
         * 3. updatedAt が未指定の場合、値が設定されること (現在時刻)
         * 4. tags が未指定の場合、空配列になること
         * 
         * ## 期待される動作
         * - 入力: 必須項目のみのオブジェクト
         * - 出力: 省略された項目にデフォルト値が設定されたインスタンス
         */
        it('should set default timestamps and empty content if not provided', () => {
            const noteData = {
                userId: 'user123',
                title: 'Test Note'
            };

            const note = new Note(noteData);

            expect(note.content).toBe('');
            expect(note.tags).toEqual([]);
            expect(note.createdAt).toBeDefined();
            expect(note.updatedAt).toBeDefined();
        });
    });

    /**
     * @description バリデーションロジックの仕様
     * 
     * ## 業務ルール
     * - ユーザーIDは必須
     * - タイトルは必須
     * - タイトルは100文字以内
     */
    describe('validate', () => {
        /**
         * @test 正常系バリデーション
         * 
         * ## 検証項目
         * 1. 有効なデータの場合、エラーが発生しないこと
         */
        it('should pass validation with valid data', () => {
            const note = new Note({
                userId: 'user123',
                title: 'Test Note',
                content: 'Content'
            });

            expect(() => note.validate()).not.toThrow();
        });

        /**
         * @test ユーザーID必須チェック
         * 
         * ## 検証項目
         * 1. userId が空の場合、特定のエラーメッセージをスローすること
         */
        it('should throw error if userId is missing', () => {
            const note = new Note({
                userId: '',
                title: 'Test Note'
            });

            expect(() => note.validate()).toThrow('ユーザーIDは必須です');
        });

        /**
         * @test タイトル必須チェック
         * 
         * ## 検証項目
         * 1. title が空の場合、特定のエラーメッセージをスローすること
         */
        it('should throw error if title is missing', () => {
            const note = new Note({
                userId: 'user123',
                title: ''
            });

            expect(() => note.validate()).toThrow('タイトルは必須です');
        });

        /**
         * @test タイトル長チェック
         * 
         * ## 検証項目
         * 1. title が100文字を超える場合、特定のエラーメッセージをスローすること
         */
        it('should throw error if title exceeds 100 characters', () => {
            const note = new Note({
                userId: 'user123',
                title: 'a'.repeat(101)
            });

            expect(() => note.validate()).toThrow('タイトルは100文字以内で入力してください');
        });

        /**
         * @test タグ配列チェック
         * 
         * ## 検証項目
         * 1. tags が配列でない場合、特定のエラーメッセージをスローすること
         */
        it('should throw error if tags is not an array', () => {
            const note = new Note({
                userId: 'user123',
                title: 'Test Note',
                tags: 'not-an-array'
            });

            expect(() => note.validate()).toThrow('タグは配列である必要があります');
        });
    });

    /**
     * @description Firestore データ変換仕様
     * 
     * ## 機能要件
     * - エンティティを Firestore 保存用の形式に変換する
     * - Firestore から取得したデータからエンティティを復元する
     */
    describe('toFirestore', () => {
        /**
         * @test Firestore 保存形式への変換
         * 
         * ## 検証項目
         * 1. オブジェクト形式で返却されること
         * 2. id は Firestore ドキュメントIDとして扱われるため、データフィールドには含めない
         */
        it('should convert to Firestore format', () => {
            const note = new Note({
                id: 'note123',
                userId: 'user123',
                title: 'Test Note',
                content: 'Content',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            });

            const firestoreData = note.toFirestore();

            expect(firestoreData).toEqual({
                userId: 'user123',
                title: 'Test Note',
                content: 'Content',
                tags: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            });
            expect(firestoreData).not.toHaveProperty('id');
        });
    });

    describe('fromFirestore', () => {
        /**
         * @test Firestore データからの復元
         * 
         * ## 検証項目
         * 1. Firestore のデータフィールドと ID からエンティティが正しく生成されること
         */
        it('should create Note from Firestore data', () => {
            const firestoreData = {
                userId: 'user123',
                title: 'Test Note',
                content: 'Content',
                tags: ['tag1'],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            };

            const note = Note.fromFirestore('note123', firestoreData);

            expect(note.id).toBe('note123');
            expect(note.userId).toBe('user123');
            expect(note.title).toBe('Test Note');
            expect(note.content).toBe('Content');
            expect(note.tags).toEqual(['tag1']);
            expect(note.createdAt).toBe('2024-01-01T00:00:00.000Z');
            expect(note.updatedAt).toBe('2024-01-02T00:00:00.000Z');
        });
    });
});
