import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import config from '@/payload.config'
import React from 'react'
import type { Metadata } from 'next'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{
    segments?: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> => {
  return generatePageMetadata({
    config,
    params: params as Promise<{ segments: string[] }>,
    searchParams: searchParams as Promise<{ [key: string]: string | string[] }>,
  })
}

const Page = async ({ params, searchParams }: Args) => {
  return RootPage({
    config,
    importMap,
    params: params as Promise<{ segments: string[] }>,
    searchParams: searchParams as Promise<{ [key: string]: string | string[] }>,
  })
}

export default Page
