"use client"
import React from 'react'
import { Github, BookOpen, Settings, Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {useSession} from '@/lib/auth-client'
import { Wallet, LayoutDashboard, ScrollText} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import Logout from '@/module/auth/components/logout'


const navItems = [
  {
    title : "Dashboard",
    url : "/dashboard",
    icon : LayoutDashboard
  },
  {
    title : "Respository",
    url : "/dashboard/repository",
    icon : Github
  },
  {
    title : "Reviews",
    url : "/dashboard/reviews",
    icon : BookOpen
  },
  {
    title : "Subscription",
    url : "/dashboard/subscription",
    icon : Wallet
  },
  {
    title : "Score",
    url : "/dashboard/score",
    icon : ScrollText
  },
  {
    title : "Settings",
    url : "/dashboard/settings",
    icon : Settings
  }
]

const AppSidebar = () => {
  const {theme, setTheme} = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathName = usePathname()
  const {data : session} = useSession()
  
  useEffect(() => {
    setMounted(true)
  }, [])


  const isActive = (url : string) => {
    return pathName === url || pathName.startsWith(url + "/dashboard")
  }

  if(!mounted  || !session) return null

  const user = session.user;
  const userName = user.name || "GUEST"
  const userEmail = user.email  || ""
  const userInitials = userName.split(' ').map((s) => s[0]).join("").toUpperCase()
  const userAvatar = user.image || " "

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className='flex p-4 overflow-hidden gap-3'>
            <div className='bg-blue-500 p-3 rounded shrink-0'><Github className='size-[2rem]'/></div>
            <div>
              <p className='font-bold text-lg shrink-0'>{userName}</p>
              <p className='text-[12px] font-light shrink-0'>{userEmail}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-6 flex-col gap-1 border-b">
        <div className="mb-2">
          <p className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-3 uppercase tracking-widest">Menu</p>
        </div>
        <SidebarMenu className="gap-2">
          {
            navItems.map((item)=> (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 px-4 rounded-lg transition-all duration-200 ${isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "hover:bg-sidebar-accent/60 text-sidebar-foreground"}`}>
                  <Link href={item.url} className="flex items-center gap-3 ">
                    <item.icon className="w-5 h-5 flex-shrink-0"/>
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          }
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <SidebarMenuButton size="lg" className="mb-15">
                            <Avatar className="h-10 w-10 rounded-lg shrink-0">
                                <AvatarImage src={userAvatar || "/placeholder.svg"} alt={userName} className='rounded-lg'/>
                                <AvatarFallback className="rounded-lg">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                              <span className='font-bold text-lg shrink-0'>{userName}</span>
                              <span className='text-[12px] font-light shrink-0'>{userEmail}</span>
                            </div>
                      </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-80 rounded-lg" align='end' side ='right' sideOffset={8}>
                     <div className="px-2 border-t border-b">
                      <DropdownMenuItem asChild>
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                         {
                           theme === "dark" ? (<>
                             <Sun className="w-5 h-5 shrink-0 mr-4"/>
                             <span>Light Mode</span>
                           </>) : (<>
                              <Moon className="w-5 h-5 shrink-0 mr-4"/>
                              <span>Dark Mode</span>
                           </>)
                         }
                        </button>
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer px-3 py-3 my-1 rounded-md hover:bg-red-50/10 hover:text-red-600 transition-colors font-medium' >{
                          <><LogOut className='w-5 h-5 mr-3 shrink-0' /><Logout>Sign Out</Logout></>
                      }</DropdownMenuItem>
                     </div>
                  </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar