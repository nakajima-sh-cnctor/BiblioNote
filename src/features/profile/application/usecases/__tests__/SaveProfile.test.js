import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveProfile } from '../SaveProfile';
import { Profile } from '../../../domain/entities/Profile';

// モックリポジトリ
class MockProfileRepository {
    constructor() {
        this.profiles = new Map();
    }

    async save(profile) {
        this.profiles.set(profile.userId, profile);
    }

    async findByUserId(userId) {
        return this.profiles.get(userId) || null;
    }

    async exists(userId) {
        return this.profiles.has(userId);
    }
}

describe('SaveProfile Use Case', () => {
    let saveProfile;
    let mockRepository;

    beforeEach(() => {
        mockRepository = new MockProfileRepository();
        saveProfile = new SaveProfile(mockRepository);
    });

    describe('新規プロフィール作成', () => {
        it('should create a new profile successfully', async () => {
            const profileData = {
                name: '山田太郎',
                gender: 'male'
            };

            const result = await saveProfile.execute('user123', profileData);

            expect(result).toBeInstanceOf(Profile);
            expect(result.userId).toBe('user123');
            expect(result.name).toBe('山田太郎');
            expect(result.gender).toBe('male');
            expect(result.createdAt).toBeDefined();
            expect(result.updatedAt).toBeDefined();
        });

        it('should save profile to repository', async () => {
            const profileData = {
                name: '山田太郎',
                gender: 'male'
            };

            await saveProfile.execute('user123', profileData);

            const saved = await mockRepository.findByUserId('user123');
            expect(saved).toBeDefined();
            expect(saved.name).toBe('山田太郎');
        });
    });

    describe('既存プロフィール更新', () => {
        it('should update existing profile', async () => {
            // 既存プロフィールを作成
            const existingProfile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            });
            await mockRepository.save(existingProfile);

            // 更新
            const updatedData = {
                name: '山田花子',
                gender: 'female'
            };

            const result = await saveProfile.execute('user123', updatedData);

            expect(result.name).toBe('山田花子');
            expect(result.gender).toBe('female');
            expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z'); // 作成日は変わらない
            expect(result.updatedAt).not.toBe('2024-01-01T00:00:00.000Z'); // 更新日は変わる
        });

        it('should preserve createdAt when updating', async () => {
            const originalCreatedAt = '2024-01-01T00:00:00.000Z';
            const existingProfile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male',
                createdAt: originalCreatedAt,
                updatedAt: originalCreatedAt
            });
            await mockRepository.save(existingProfile);

            const updatedData = {
                name: '山田次郎',
                gender: 'male'
            };

            const result = await saveProfile.execute('user123', updatedData);

            expect(result.createdAt).toBe(originalCreatedAt);
        });
    });

    describe('バリデーション', () => {
        it('should throw error if name is empty', async () => {
            const profileData = {
                name: '',
                gender: 'male'
            };

            await expect(
                saveProfile.execute('user123', profileData)
            ).rejects.toThrow('名前は必須です');
        });

        it('should throw error if gender is invalid', async () => {
            const profileData = {
                name: '山田太郎',
                gender: 'invalid'
            };

            await expect(
                saveProfile.execute('user123', profileData)
            ).rejects.toThrow('性別を選択してください');
        });

        it('should throw error if name exceeds 50 characters', async () => {
            const profileData = {
                name: 'あ'.repeat(51),
                gender: 'male'
            };

            await expect(
                saveProfile.execute('user123', profileData)
            ).rejects.toThrow('名前は50文字以内で入力してください');
        });
    });

    describe('エッジケース', () => {
        it('should handle all valid gender values', async () => {
            const genders = ['male', 'female', 'other'];

            for (const gender of genders) {
                const profileData = {
                    name: 'テストユーザー',
                    gender
                };

                const result = await saveProfile.execute(`user_${gender}`, profileData);
                expect(result.gender).toBe(gender);
            }
        });

        it('should trim whitespace from name during validation', async () => {
            const profileData = {
                name: '  山田太郎  ',
                gender: 'male'
            };

            // バリデーションは通るが、保存される値はトリムされていない
            const result = await saveProfile.execute('user123', profileData);
            expect(result.name).toBe('  山田太郎  ');
        });
    });
});
