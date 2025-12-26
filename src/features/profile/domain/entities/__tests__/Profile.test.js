import { describe, it, expect } from 'vitest';
import { Profile } from '../Profile';

describe('Profile Entity', () => {
    describe('constructor', () => {
        it('should create a profile with all fields', () => {
            const profileData = {
                userId: 'user123',
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            };

            const profile = new Profile(profileData);

            expect(profile.userId).toBe('user123');
            expect(profile.name).toBe('山田太郎');
            expect(profile.gender).toBe('male');
            expect(profile.createdAt).toBe('2024-01-01T00:00:00.000Z');
            expect(profile.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should set default timestamps if not provided', () => {
            const profileData = {
                userId: 'user123',
                name: '山田太郎',
                gender: 'male'
            };

            const profile = new Profile(profileData);

            expect(profile.createdAt).toBeDefined();
            expect(profile.updatedAt).toBeDefined();
            expect(typeof profile.createdAt).toBe('string');
            expect(typeof profile.updatedAt).toBe('string');
        });
    });

    describe('validate', () => {
        it('should pass validation with valid data', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male'
            });

            expect(() => profile.validate()).not.toThrow();
        });

        it('should throw error if userId is missing', () => {
            const profile = new Profile({
                userId: '',
                name: '山田太郎',
                gender: 'male'
            });

            expect(() => profile.validate()).toThrow('ユーザーIDは必須です');
        });

        it('should throw error if name is missing', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '',
                gender: 'male'
            });

            expect(() => profile.validate()).toThrow('名前は必須です');
        });

        it('should throw error if name is only whitespace', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '   ',
                gender: 'male'
            });

            expect(() => profile.validate()).toThrow('名前は必須です');
        });

        it('should throw error if name exceeds 50 characters', () => {
            const profile = new Profile({
                userId: 'user123',
                name: 'あ'.repeat(51),
                gender: 'male'
            });

            expect(() => profile.validate()).toThrow('名前は50文字以内で入力してください');
        });

        it('should throw error if gender is missing', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: ''
            });

            expect(() => profile.validate()).toThrow('性別を選択してください');
        });

        it('should throw error if gender is invalid', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'invalid'
            });

            expect(() => profile.validate()).toThrow('性別を選択してください');
        });

        it('should accept male as valid gender', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male'
            });

            expect(() => profile.validate()).not.toThrow();
        });

        it('should accept female as valid gender', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田花子',
                gender: 'female'
            });

            expect(() => profile.validate()).not.toThrow();
        });

        it('should accept other as valid gender', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '田中',
                gender: 'other'
            });

            expect(() => profile.validate()).not.toThrow();
        });
    });

    describe('toFirestore', () => {
        it('should convert to Firestore format', () => {
            const profile = new Profile({
                userId: 'user123',
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            });

            const firestoreData = profile.toFirestore();

            expect(firestoreData).toEqual({
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            });
            expect(firestoreData).not.toHaveProperty('userId');
        });
    });

    describe('fromFirestore', () => {
        it('should create Profile from Firestore data', () => {
            const firestoreData = {
                name: '山田太郎',
                gender: 'male',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z'
            };

            const profile = Profile.fromFirestore('user123', firestoreData);

            expect(profile.userId).toBe('user123');
            expect(profile.name).toBe('山田太郎');
            expect(profile.gender).toBe('male');
            expect(profile.createdAt).toBe('2024-01-01T00:00:00.000Z');
            expect(profile.updatedAt).toBe('2024-01-02T00:00:00.000Z');
        });
    });
});
