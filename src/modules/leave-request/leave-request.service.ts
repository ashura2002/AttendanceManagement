import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LeaveRequestService {
  constructor(
    @InjectRepository(Request)
    private readonly leaveReqRepo: Repository<Request>,
  ) {}
}
