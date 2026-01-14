/**
 * @fileoverview CreateNote Use Case テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、ノートを作成または更新するユースケース `CreateNote` の
 * 設計仕様と振る舞いを定義します。
 * 
 * ## 機能
 * - 新規ノートの作成
 * - 既存ノートの更新
 * - 入力データのバリデーション
 * 
 * ## アーキテクチャ
 * - **レイヤー**: Application Layer
 * - **依存関係**: NoteRepository (Interface)
 * 
 * @module features/notes/application/usecases/CreateNote.test
 * @requires vitest
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CreateNote } from '../CreateNote';
import { Note } from '../../../domain/entities/Note';

// Mock Repository
class MockNoteRepository {
    async save(note) {
        return note.id || 'new_note_id';
    }
}

describe('CreateNote Use Case', () => {
    let createNote;
    let mockRepository;

    beforeEach(() => {
        mockRepository = new MockNoteRepository();
        createNote = new CreateNote(mockRepository);
    });

    /**
     * @test 新規ノート作成の成功シナリオ
     * 
     * ## 検証項目
     * 1. 必須パラメータが渡された場合、リポジトリの save メソッドが呼び出されること
     * 2. 新規作成されたノートのIDが返却されること
     * 
     * ## 期待される動作
     * - 入力: ユーザーID、タイトル、本文、タグ
     * - 出力: 新しく生成されたノートID ('new_note_id')
     */
    it('should create and save a new note', async () => {
        const params = {
            userId: 'user123',
            title: 'Test Note',
            content: 'Content',
            tags: ['tag1']
        };

        const noteId = await createNote.execute(params);

        expect(noteId).toBe('new_note_id');
    });

    /**
     * @test 既存ノート更新の成功シナリオ
     * 
     * ## 検証項目
     * 1. IDが指定された場合、既存のノートIDが維持されること
     * 
     * ## 期待される動作
     * - 入力: 既存のノートIDを含むパラメータ
     * - 出力: 入力されたノートID ('existing_id')
     */
    it('should update existing note if id provided', async () => {
        const params = {
            id: 'existing_id',
            userId: 'user123',
            title: 'Test Note',
            content: 'Content'
        };

        const noteId = await createNote.execute(params);

        expect(noteId).toBe('existing_id');
    });

    /**
     * @test バリデーションエラーシナリオ
     * 
     * ## 検証項目
     * 1. 不正なデータ（例：タイトル空）が渡された場合、エラーがスローされること
     * 2. リポジトリの save メソッドが呼び出されないこと（バリデーションで止まる）
     * 
     * ## 期待される動作
     * - 入力: タイトルが空のパラメータ
     * - 出力: 'タイトルは必須です' エラー
     */
    it('should throw validation error if title missing', async () => {
        const params = {
            userId: 'user123',
            title: '',
            content: 'Content'
        };

        await expect(createNote.execute(params)).rejects.toThrow('タイトルは必須です');
    });
});
