import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketTierDto } from '../dto';
import { Event, TicketSaleTransaction, TicketTier } from '../entities';
import { SCService } from '../services/sc.service';
import { Repository } from 'typeorm';

@Injectable()
export class TicketTiersService {
  constructor(
    private readonly scService: SCService,
    @InjectRepository(TicketTier)
    private readonly ticketTierRepository: Repository<TicketTier>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketSaleTransaction)
    private readonly ticketSaleTransactionRepository: Repository<TicketSaleTransaction>,
  ) {}

  async getTicketTierDetails(tierId: string) {
    const ticketTier = await this.ticketTierRepository.findOne({
      where: { id: tierId },
      relations: ['event'],
    });

    if (!ticketTier) {
      throw new NotFoundException('Ticket tier not found');
    }
    const quantity = await this.scService.getRemainingTickets(
      ticketTier.event.onChainId,
      ticketTier.tierIndex,
    );

    return {
      ...ticketTier,
      availableSupply: quantity,
    };
  }

  async createTicketTiers(eventId: string, ticketTierDto: TicketTierDto[]) {
    console.log(ticketTierDto);
    const ticketTiers: TicketTier[] = [];
    for (let i = 0; i < ticketTierDto.length; i++) {
      let ticketTierInput = this.ticketTierRepository.create({
        name: ticketTierDto[i].name,
        price: ticketTierDto[i].price,
        royaltyPercentage: ticketTierDto[i].royaltyTicketTier,
        availableSupply: ticketTierDto[i].quantity,
        totalSupply: ticketTierDto[i].quantity,
        maxResalePrice: ticketTierDto[i].maxResalePrice,
        minResalePrice: ticketTierDto[i].minResalePrice,
        event: { id: eventId },
        description: ticketTierDto[i].description,
      });

      ticketTiers.push(ticketTierInput);
    }
    const ticketData = await this.ticketTierRepository.save(ticketTiers);
    return ticketData;
  }

  async deleteTicketTiers(eventId: string) {
    const ticketTiers: TicketTier[] = await this.ticketTierRepository.find({
      where: { event: { id: eventId } },
    });

    if (!ticketTiers) {
      return;
    }

    await Promise.all(
      ticketTiers.map((ticketTier) => {
        this.ticketTierRepository.delete(ticketTier.id);
      }),
    );
  }

  async updateTierIndex(tierId: string, tierIndex: number) {
    console.log(tierId, tierIndex);
    await this.ticketTierRepository.update(tierId, {
      tierIndex,
    });
    return this.ticketTierRepository.findOne({
      where: { id: tierId },
    });
  }
}
