/**
 * @fileoverview GetUserNotes Use Case テスト仕様書
 * 
 * ## 概要
 * このテストファイルは、特定ユーザーのノート一覧を取得するユースケース `GetUserNotes` の
 * 設計仕様と振る舞いを定義します。
 * 
 * ## 機能
 * - ユーザーIDに基づいたノート一覧の取得
 * - 入力パラメータ（ユーザーID）の検証
 * 
 * ## アーキテクチャ
 * - **レイヤー**: Application Layer
 * - **依存関係**: NoteRepository (Interface)
 * 
 * @module features/notes/application/usecases/GetUserNotes.test
 * @requires vitest
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetUserNotes } from '../GetUserNotes';

// Mock Repository
const mockNoteRepository = {
    findByUserId: vi.fn()
};

describe('GetUserNotes Use Case', () => {
    let getUserNotes;

    beforeEach(() => {
        vi.clearAllMocks();
        getUserNotes = new GetUserNotes(mockNoteRepository);
    });

    /**
     * @test ノート一覧取得の成功シナリオ
     * 
     * ## 検証項目
     * 1. 正しいユーザーIDでリポジトリが呼び出されること
     * 2. リポジトリから返されたノート一覧がそのまま返却されること
     * 
     * ## 期待される動作
     * - 入力: 有効なユーザーID
     * - 出力: ノートオブジェクトの配列
     */
    it('should return a list of notes for the user', async () => {
        const userId = 'user123';
        const expectedNotes = [
            { id: '1', title: 'Note 1', userId },
            { id: '2', title: 'Note 2', userId }
        ];

        mockNoteRepository.findByUserId.mockResolvedValue(expectedNotes);

        const notes = await getUserNotes.execute(userId);

        expect(mockNoteRepository.findByUserId).toHaveBeenCalledWith(userId);
        expect(notes).toEqual(expectedNotes);
    });

    /**
     * @test バリデーションエラー（ユーザーID未指定）
     * 
     * ## 検証項目
     * 1. ユーザーIDが提供されない場合、エラーがスローされること
     * 
     * ## 期待される動作
     * - 入力: null または 空文字
     * - 出力: 'ユーザーIDは必須です' エラー
     */
    it('should throw error if userId is missing', async () => {
        await expect(getUserNotes.execute(null)).rejects.toThrow('ユーザーIDは必須です');
        await expect(getUserNotes.execute('')).rejects.toThrow('ユーザーIDは必須です');
    });

    /**
     * @test データが存在しない場合のシナリオ
     * 
     * ## 検証項目
     * 1. ノートが存在しない場合、空の配列が返されること
     * 
     * ## 期待される動作
     * - 入力: ノートを持たないユーザーID
     * - 出力: 空配列 []
     */
    it('should return empty array if no notes found', async () => {
        mockNoteRepository.findByUserId.mockResolvedValue([]);

        const notes = await getUserNotes.execute('user_no_notes');

        expect(notes).toEqual([]);
    });
});
