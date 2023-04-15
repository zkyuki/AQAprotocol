import { v4 } from "uuid";
import { 
  LensClient,
  PublicationMainFocus,
} from "@lens-protocol/client";
import { EoaOwnership, LensGatedSDK, LensEnvironment, EncryptedMetadata } from '@lens-protocol/sdk-gated';
import { ethers } from "ethers";
import * as IPFS from 'ipfs-core'; 

import { newLensClient } from './lens/client';
import { Data } from './model/data';

// TODO: Replace the address placeholder with a real wallet address
// Allowed address is for the demo application (SNS here) that utilizes data
const accessControlCondition: EoaOwnership = {
  address: "0x000000",
}

const uploadMetadataHandler = async (data: EncryptedMetadata): Promise<string> => {
  const ipfs = await IPFS.create()
  const { path } = await ipfs.add(data as unknown as string)
  return `ipfs://${path}`
}

export class AqaClient {
  private lensClient: LensClient
  private lensGatedSDK: LensGatedSDK
  private provider: ethers.providers.Web3Provider

  constructor(provider: ethers.providers.Web3Provider) {
    this.lensClient = newLensClient();
    this.provider = provider;
  }

  async authenticate(): Promise<void> {
    const signer = this.provider.getSigner();
    const gatedClient = await LensGatedSDK.create({
      provider: this.provider,
      signer: signer,
      env: LensEnvironment.Mumbai,
    });
  
    const address = await signer.getAddress();
    await gatedClient.connect({
      address: address,
      env: LensEnvironment.Mumbai
    })

    this.lensGatedSDK = gatedClient;
  }

  async saveData(data: Data): Promise<void> {
    const profileId = await this.getProfileId(await this.provider.getSigner().getAddress());

    const metadata = {
      version: "2.0.0",
      name: "Sample data",
      description: "Sample data",
      attributes: [],
      appId: data.provider,
      content: data.contents,
      mainContentFocus: PublicationMainFocus.TextOnly,
      metadata_id: v4(),
      tags: [data.provider, data.category],
      locale: "en",
    };

    // validate metadata
    const validateResult = await this.lensClient.publication.validateMetadata(metadata);
    if (!validateResult.valid) {
      throw new Error(`Metadata is not valid.`);
    }

    // Encrypt and save metadata
    const { contentURI, encryptedMetadata } = await this.lensGatedSDK.gated.encryptMetadata(
      metadata,
      profileId,
      {
        eoa: accessControlCondition,
      },
      uploadMetadataHandler,
    )

    if (!contentURI || !encryptedMetadata) {
      throw new Error(`Failed to save metadata to IPFS`);
    }

    await this.lensClient.publication.createPostViaDispatcher({
      profileId,
      contentURI,
      collectModule: {
        revertCollectModule: true, // collect disabled
      },
      referenceModule: {
        degreesOfSeparationReferenceModule: { // nobody can comment or mirror including the poster
          commentsRestricted: true,
          mirrorsRestricted: true,
          degreesOfSeparation: 0
        }
      },
      gated: {
        eoa: accessControlCondition,
        encryptedSymmetricKey: encryptedMetadata.encryptionParams.providerSpecificParams.encryptionKey,
      },
    });
  }

  async getProfileId(address: string): Promise<string> {
    const ownedProfiles = await this.lensClient.profile.fetchAll({
      ownedBy: [address],
      limit: 1,
    });
  
    if (ownedProfiles.items.length === 0) {
      throw new Error(`You don't have any profiles, create one first`);
    }
  
    return ownedProfiles.items[0].id;
  }
}
