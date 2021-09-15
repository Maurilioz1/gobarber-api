import FakeAppointmentsRepository from '@modules/appointments/repositories/fakes/FakeAppointmentsRepository';
import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';
import FakeNotificationsRepository from '@modules/notifications/repositories/fakes/FakeNotificationsRepository';
import FakeCacheProvider from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import AppError from '@shared/errors/AppError';

let fakeAppointmentsRepository: FakeAppointmentsRepository;
let fakeNotificationsRepository: FakeNotificationsRepository;
let fakeCacheProvider: FakeCacheProvider;
let createAppointment: CreateAppointmentService;

describe('CreateAppointment', () => {
    beforeEach(() => {
        fakeAppointmentsRepository = new FakeAppointmentsRepository();
        fakeNotificationsRepository = new FakeNotificationsRepository();
        fakeCacheProvider = new FakeCacheProvider();
        createAppointment = new CreateAppointmentService(
            fakeAppointmentsRepository,
            fakeNotificationsRepository,
            fakeCacheProvider,
        );
    });

    it('should be able to create a new apponitment', async () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => {
            return new Date(2020, 4, 10, 12).getTime();
        });

        const appointment = await createAppointment.execute({
            provider_id: 'provider_id',
            user_id: 'user_id',
            date: new Date(2020, 4, 10, 13),
        });

        expect(appointment).toHaveProperty('id');
        expect(appointment.provider_id).toBe('provider_id');
    });

    it('should not be able to create two or more apponitments in the same date', async () => {
        const appointmentDate = new Date();

        jest.spyOn(Date, 'now').mockImplementation(() => {
            return new Date(2020, 4, 10, 10).getTime();
        });

        await createAppointment.execute({
            provider_id: 'provider_id',
            user_id: 'user_id',
            date: appointmentDate,
        });

        await expect(
            createAppointment.execute({
                provider_id: 'provider_id',
                user_id: 'user_id',
                date: appointmentDate,
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to create an apponitment on a past date', async () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => {
            return new Date(2021, 4, 10, 12).getTime();
        });

        await expect(
            createAppointment.execute({
                date: new Date(2021, 4, 10, 11),
                provider_id: 'provider-id',
                user_id: 'user-id',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to create an apponitment with same user as provider', async () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => {
            return new Date(2021, 4, 10, 12).getTime();
        });

        await expect(
            createAppointment.execute({
                date: new Date(2021, 4, 10, 13),
                provider_id: 'provider-id',
                user_id: 'provider-id',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('should not be able to create an apponitment out office hour', async () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => {
            return new Date(2021, 4, 10, 12).getTime();
        });

        await expect(
            createAppointment.execute({
                date: new Date(2021, 4, 11, 7),
                provider_id: 'provider-id',
                user_id: 'user-id',
            }),
        ).rejects.toBeInstanceOf(AppError);

        await expect(
            createAppointment.execute({
                date: new Date(2021, 4, 11, 18),
                provider_id: 'provider-id',
                user_id: 'user-id',
            }),
        ).rejects.toBeInstanceOf(AppError);
    });
});
