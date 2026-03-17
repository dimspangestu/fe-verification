import React, { useState } from 'react'
import sample from '@/assets/sample1.jpg'
import Image from 'next/image'
import dayjs from 'dayjs'
import { RiEdit2Fill } from 'react-icons/ri'
import { BsThreeDots } from 'react-icons/bs'
import Card from '../Card'

export const Activities = ({item, profileImage, onEdit}) => {

    const [showDropdown, setshowDropdown] = useState(false)


  return (
    <Card className={"flex space-y-5 flex-col p-6 w-full"}>
        <div className='relative flex w-full'>
            <div className='absolute -left-3 -top-3 right-0 w-[40px] overflow-hidden h-[40px] rounded-full'>
                <div className='absolute flex top-3 w-full'>
                    <img src={profileImage} />
                </div>
            </div>
            <div className='relative flex flex-col ml-10 h-full w-full'>
                <div className='flex h-full w-full items-center justify-between'>
                    <p className='flex'>Added {item.type}</p>
                    <div className='flex justify-end text-gray-light'>{dayjs(item.created_at).format("MMMM, DD YYYY")}</div>
                </div>
                <div className='flex flex-col pt-2'>
                    <p className='text-sm text-blue-light-500'>{item.type == "vacancy" ? item.name_vacancies : ''}</p>
                    <div dangerouslySetInnerHTML={{__html: item.description}} className='text-sm pt-1' />
                </div>
            </div>
        </div>
        <div className='relative flex flex-col w-full'>
            <div className='w-full border-b border-gray-light-50'/>
            <div className='flex pt-2 justify-end space-x-2'>
                <div onClick={onEdit} className='w-5 hover:cursor-pointer text-gray-dark opacity-35'>
                    <RiEdit2Fill />
                </div>
                <div onClick={setshowDropdown} className='w-5 hover:cursor-pointer text-gray-dark opacity-35'>
                    <BsThreeDots />
                </div>
                {
                    showDropdown && (
                        <div onMouseLeave={() => setshowDropdown(false)} className='absolute right-0 top-0 bg-white shadow-lg rounded-lg'>
                            <p className='text-sm w-full hover:bg-slate-200 hover:cursor-pointer p-3'>Delete</p>
                        </div>
                    )
                }
            </div>
        </div>
    </Card>
  )
}
