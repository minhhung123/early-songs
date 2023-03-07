import { ethers } from 'ethers';
import axios from 'axios';
import { earlySongsPlatformAddress } from '../../../utils/addresses';
import EarlySongsPlatform from '../../../abis/EarlySongsPlatform.json';
import SharableSong from '../../../abis/ShareableSong.json';

export const loadPlatformContracts = async () : Promise<any[]> => {
    const provider = new ethers.providers.JsonRpcProvider("https://fantom-testnet.public.blastapi.io");
    const platformContract = new ethers.Contract(
        earlySongsPlatformAddress,
        EarlySongsPlatform.abi,
        provider
    );
    const data = await platformContract.fetchPlatformItems();
    const items = await Promise.all(data.map(async (i: any) => {
        const songContract = new ethers.Contract(
            i.nftContract,
            SharableSong.abi,
            provider
        );
        
        const metadataUrl = await songContract.getMetadata();
        const wei = ethers.utils.formatUnits(i.mintPrice.toString(), 'wei');
        const metadata = await axios.get(metadataUrl);
        
        // Metadata should include:
        // songUrl: string
        // thumbnailUrl: string
        // songName: string
        // description: string
        // available day: string
        // genres: array of string
        
        const item = {
            itemId: i.itemId,
            nftContract: i.nftContract,
            artist: i.artist,
            mintPrice: (Number(wei)).toString(),
            songUrl: metadata.data.songUrl,
            thumbnailUrl: metadata.data.thumbnailUrl,
            songName: metadata.data.songName,
            description: metadata.data.description,
            availableDay: metadata.data.availableDay,
            genres: metadata.data.genres,
        }
        return item;
    }))

    return items;
}