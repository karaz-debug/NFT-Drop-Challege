import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { sanityClient, urlFor} from '../sanity' 
import { Collection } from '../typings'

interface Props {
  collections: Collection[]
}

const Home = ({collections}: Props) => {
  const router = useRouter();
  console.log(collections)
  // overflow-x-hidden overflow-y-auto bg-purple-400
  return (
    <div className="flex flex-col min-h-screen px-10 py-20 mx-auto overflow-x-hidden overflow-y-auto bg-purple-400 max-w-7xl 2xl:px-0">
      <Head>
        <title>NFT Drop</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mb-6 text-4xl font-extralight">
          <h1 className="text-xl text-center text-white cursor-pointer w-52 font-extralight sm:w-80">
                  The{' '}
                  <span className="font-extrabold text-green-300 underline decoration-purple-600 " >SHABBELL APES</span> {'  '}
                  NFT Market Place
          </h1>
      </div>

     <main className="p-5 m-4 mt-4 bg-purple-600 rounded-2xl shadoow-xl shadow-blue-800">
       <div className="grid space-x-3 md:grid-cols-2 md:grid-col-3 lg:grid-col-4 2xl:grid-col-4">
         {collections.map((collection) => (
           <Link href={`/nft/${collection.slug.current}`}>
              <div className="flex flex-col items-center pt-12 transition-all duration-200 cursor-pointer hover:scale-105">
                 <img className="object-cover w-60 rounded-2xl h-96" src={urlFor(collection.mainImage).url()} alt="" />
                 <div className="p-5">
                    <h1 className="text-3xl text-center text-white">{collection.title}</h1>
                    <p className="mt-2 text-sm text-center text-gray-300"> {collection.description}</p>
                </div>
              </div>
           </Link>
         ))}
       </div>
     </main>
     <div className="mt-4 mb-5 text-center">
        <h1 className="mb-3 text-2xl font-extrabold text-white">Welcome too NFT DROP Market </h1>
        <button onClick={() => router.push(`/nft/NFTDropPage`)} className="w-40 p-4 text-white bg-green-300 rounded-full ">Lauch NFT </button>
     </div>
    </div>
  )
}



export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `*[_type == "collection"]{
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
  const collections = await sanityClient.fetch(query);
  console.log(collections)

  return{
    props:{
      collections
    } 
  }
   

}
