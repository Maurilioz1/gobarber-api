import { startOfHour, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';
import Appointment from '@modules/appointments/infra/typeorm/entities/Appointment';
import AppError from '@shared/errors/AppError';
import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/repositories/INotificationsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

interface IRequest {
    provider_id: string;
    user_id: string;
    date: Date;
}

@injectable()
class CreateAppointmentService {
    constructor(
        @inject('AppointmentsRepository')
        private appointmentsRepository: IAppointmentsRepository,

        @inject('NotificationsRepository')
        private notificationsRepository: INotificationsRepository,

        @inject('CacheProvider')
        private cacheProviderRepository: ICacheProvider,
    ) {}

    public async execute({
        provider_id,
        user_id,
        date,
    }: IRequest): Promise<Appointment> {
        const appointmentDate = startOfHour(date);

        if (isBefore(appointmentDate, Date.now())) {
            throw new AppError(
                'Você não pode fazer um agendamento em uma data passada.',
            );
        }

        if (user_id === provider_id) {
            throw new AppError(
                'Você não pode fazer um agendamento consigo mesmo.',
            );
        }

        if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
            throw new AppError('Horário fora de expediente.');
        }

        const findAppointmentInSameDate =
            await this.appointmentsRepository.findByDate(
                appointmentDate,
                provider_id,
            );

        if (findAppointmentInSameDate) {
            throw new AppError(
                'Um agendamento já foi cadastrado no horário requisitado.',
            );
        }

        const appointment = await this.appointmentsRepository.create({
            provider_id,
            user_id,
            date: appointmentDate,
        });

        const dateFormatted = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm");

        await this.notificationsRepository.create({
            recipient_id: provider_id,
            content: `Novo agendamento para dia ${dateFormatted}`,
        });

        await this.cacheProviderRepository.invalidate(
            `provider-appointments:${provider_id}:${format(
                appointmentDate,
                'yyyy-M-d',
            )}`,
        );

        return appointment;
    }
}

export default CreateAppointmentService;
