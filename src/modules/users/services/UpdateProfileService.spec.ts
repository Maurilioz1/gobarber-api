import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import UpdateProfileService from '@modules/users/services/UpdateProfileService';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import AppError from '@shared/errors/AppError';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let updateProfile: UpdateProfileService;

describe('UpdateProfile', () => {
    beforeEach(() => {
        fakeUsersRepository = new FakeUsersRepository();
        fakeHashProvider = new FakeHashProvider();

        updateProfile = new UpdateProfileService(
            fakeUsersRepository,
            fakeHashProvider,
        );
    });

    it('should be able to update the profile', async () => {
        const user = await fakeUsersRepository.create({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        const updtatedUser = await updateProfile.execute({
            user_id: user.id,
            name: 'User Name Updated',
            email: 'new.email@email.com',
        });

        expect(updtatedUser.name).toBe('User Name Updated');
        expect(updtatedUser.email).toBe('new.email@email.com');
    });

    it('should not be able to updtate the profile from non-existing user', async () => {
        await expect(
            updateProfile.execute({
                user_id: 'non-existing-user-id',
                name: 'User Name',
                email: 'email@email.com',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to change to another user e-mail', async () => {
        await fakeUsersRepository.create({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        const user = await fakeUsersRepository.create({
            name: 'User Name Two',
            email: 'email.two@email.com',
            password: 'Teste@123',
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'User Name Two',
                email: 'email@email.com',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should be able to update the password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        const updtatedUser = await updateProfile.execute({
            user_id: user.id,
            name: 'User Name Updated',
            email: 'new.email@email.com',
            old_password: 'Teste@123',
            password: 'Teste@456',
        });

        expect(updtatedUser.password).toBe('Teste@456');
    });

    it('should not be able to update the password without old password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'User Name Updated',
                email: 'new.email@email.com',
                password: 'Teste@456',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to update the password without wrong old password', async () => {
        const user = await fakeUsersRepository.create({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        await expect(
            updateProfile.execute({
                user_id: user.id,
                name: 'User Name Updated',
                email: 'new.email@email.com',
                old_password: 'wrong-old-password',
                password: 'Teste@456',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
