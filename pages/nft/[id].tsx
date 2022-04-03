import React, { useEffect, useState } from 'react'
import { useAddress, useDisconnect, useMetamask , useNFTDrop} from "@thirdweb-dev/react";
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import Link from 'next/link';
import { BigNumber } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

interface Props{
    collection:Collection,
}

function NFTDropPage({collection}: Props) {
  const [claimedSupply, setClaimedSupply] = useState<number>(0)
  const [totalSupply,setTotalSupply] = useState<BigNumber>()
  const [loading, setLoading] = useState<boolean>(true)
  const [priceInEth,setPriceInEth] = useState<string>()
  //Authetications
  const connectWithMetaMask = useMetamask();  
  const address = useAddress();
  const disconnect = useDisconnect();
  //   load the nftdrop available in your third web
  const nFTDrop = useNFTDrop(collection.address)

  console.log(collection.address, "address")
 
  useEffect(() => {
    if(!nFTDrop) return
    const fetchPrice = async() => {
      const claimConditions = await nFTDrop.claimConditions.getAll();
      setPriceInEth(claimConditions?.[0].currencyMetadata.displayValue)

    }
    fetchPrice()

  },[nFTDrop])

  useEffect(() => {
    if (!nFTDrop) return

    const fetchNFTDropData = async () => {
      setLoading(true)
      const claimed = await nFTDrop.getAllClaimed()
      const total = await nFTDrop.totalSupply()

      setClaimedSupply(claimed.length)
      setTotalSupply(total)
      setLoading(false)
    }

    fetchNFTDropData()
  }, [nFTDrop])
   
   //mint function
   const mintNFT = () => {
     if(!nFTDrop || !address) return;

     const quantity = 1; //how many unoque NFT's you want to claim
    
     setLoading(true);
     const notification  = toast.loading('Minting...', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px',
      },
     })

     nFTDrop.claimTo(address, quantity).then(async (tx) => {
      const receipt = tx[0].receipt
      const claimedTokenId = tx[0].id
      const claimedNFT = await tx[0].data()
     
      toast('YAY, You successfully minted your NFT!', {
        duration: 8000,
        style: {
          background: 'white',
          color: 'green',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        },
      })
      console.log(receipt)
      console.log(claimedTokenId)
      console.log(claimedNFT)
     }).catch(err => {
      console.log(err)
      toast('Whoops... something went wrong', {
        style: {
          background: 'red',
          color: 'white',
          fontWeight: 'bolder',
          fontSize: '17px',
          padding: '20px',
        },
      })
    }).finally(() => {
      setLoading(false)
      toast.dismiss(notification)
    })
     
   }
  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
      <Toaster position='bottom-center' />
      {/* left  */}
      <div className="bg-gradient-to-br from-black to-purple-400 lg:col-span-4">
          <div className="flex flex-col items-center justify-center py-2 lg:min-h-screen"> 
              <div className="p-2 bg-purple-400 bg-gradient-to-br rounded-xl from-black">
                   <img className="object-cover w-44 rounded-xl lg:h-96 lg:w-72" 
                      src={urlFor(collection.previewImage).url()} alt="" />
              </div>
              <div className="p-5 space-y-2 text-center">
                  <h1 className="text-4xl font-bold text-white">
                      {collection.nftCollectionName}
                  </h1>
                  <h2 className="text-xl text-gray-300">
                      {collection.description}
                  </h2>
              </div>
          </div>
      </div>
      {/* right */}
      <div className="flex flex-col flex-1 p-12 lg:col-span-6">
          {/* header */}
          <header className="flex items-center justify-between">
            <Link  href={'/'}>
                <h1 className="text-xl cursor-pointer w-52 font-extralight sm:w-80">
                  The{' '}
                  <span className="font-extrabold underline decoration-purple-600/50 " >PAPA AK Apes</span> {'  '}
                  NFT Market Place
                </h1>
            </Link>
            <button onClick={() =>  (address ? disconnect() : connectWithMetaMask())} className="px-4 py-2 text-xs font-bold text-white bg-purple-400 rounded-full lg:p-5 lg:p-y-3 lg:text-base" >
                {address ? 'Sign Out' : 'Sign In'}
            </button>
          </header>

          <hr className="my-2 border" />
          {address && (
              <p className="text-sm text-center text-purple-400">You're logged in with wallet {address.substring(0,5)}...{address.substring(address.length - 5)}</p>
          )}
          
          {/* content */}
          <div className="flex flex-col items-center flex-1 mt-10 space-y-6 lg:space-y-0 lg:justify-center">
              <img className="object-cover pb-10 w-80 lg:h-50 lg:w-96" src={urlFor(collection.mainImage).url()} alt="" />
              <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">{collection.title}</h1>
              
              {loading ? (
                <p className="p-2 text-xl text-blue-500 animate-pulse">
                  Loading Supply Count....
                </p>
              ) : (
                <p className="p-2 text-xl text-blue-500">
                    {claimedSupply} / {totalSupply?.toString()} NFT's claimed
                </p>

              )}

              {loading && (
                  <img className="object-contain h-50 w-80" src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="" />
              )}
              
          </div>
          

          {/* Mint button */}
          <button  
          onClick={mintNFT}
          disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} 
           className="w-full h-16 mt-10 font-bold text-white bg-purple-500 rounded-full cursor-pointer disabled:bg-gray-400">
              {loading ? (
                <>Loading</>
              ) : claimedSupply === totalSupply?.toNumber() ? (
                <>SOLD OUT</>

              ): !address ? (
                <>Sign In to Mint</>
              ):(
                <span>Mint NFT ({priceInEth} ETH)</span>
              )}
              
          </button>
      </div>
    </div>
  )
}

export default NFTDropPage;

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const query = `*[_type == "collection" && slug.current == $id][0]{
    _id,
    title,
    description,
    nftCollectionName,
    address,
    mainImage {
    asset
  },
  previewImage {
    asset
  },
  slug {
    current
  },
  creator-> {
    _id,
    name,
    address,
    slug {
    current
  },
  },
  }`

    const collection = await sanityClient.fetch(query, {
        id: params?.id
    })

    if(!collection){
        return{
            notFound:true
        }
    }

    return{
        props: {
            collection,
        }
    }
}