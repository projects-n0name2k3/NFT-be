import { IsString, IsNotEmpty, IsUrl, Matches } from 'class-validator';

export class CheckEventCreationStatusDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'transactionHash is invalid.',
  })
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'eventMetadataUrl phải là một URL hợp lệ' })
  @Matches(/^https:\/\/ipfs\.io\/ipfs\/[a-zA-Z0-9]+$/, {
    message: 'eventMetadataUrl phải có định dạng https://ipfs.io/ipfs/${cid}',
  })
  eventMetadataUrl: string;
}
