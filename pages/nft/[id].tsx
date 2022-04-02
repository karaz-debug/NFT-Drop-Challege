import React from 'react'
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { GetServerSideProps } from 'next';
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import Link from 'next/link';

interface Props{
    collection:Collection,
}

function NFTDropPage({collection}: Props) {
  //Authetications
  const connectWithMetaMask = useMetamask();  
  const address = useAddress();
  const disconnect = useDisconnect()
  console.log(address);
  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
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
              <p className="p-2 text-xl text-blue-500">
                  13 / 21 NFT's claimed
              </p>
              
          </div>
          

          {/* Mint button */}
          <button  className="w-full h-16 mt-10 font-bold text-white bg-purple-500 rounded-full">
              Mint NFT (0.01 ETH)
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