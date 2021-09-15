import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let fakeCacheProvider: FakeCacheProvider;
let createUser: CreateUserService;

describe('CreateUser', () => {
    beforeEach(() => {
        fakeUsersRepository = new FakeUsersRepository();
        fakeHashProvider = new FakeHashProvider();
        fakeCacheProvider = new FakeCacheProvider();

        createUser = new CreateUserService(
            fakeUsersRepository,
            fakeHashProvider,
            fakeCacheProvider,
        );
    });

    it('should be able to create a new user', async () => {
        const user = await createUser.execute({
            name: 'User Name',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        expect(user).toHaveProperty('id');
    });

    it('should not be able to create two users with the same e-mail', async () => {
        await createUser.execute({
            name: 'UserName',
            email: 'email@email.com',
            password: 'Teste@123',
        });

        await expect(
            createUser.execute({
                name: 'UserName',
                email: 'email@email.com',
                password: 'Teste@123',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
