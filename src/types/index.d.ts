export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}

export type Combo = {
  count1: number | null
  count2: number | null
  count3: number | null
  count4: number | null
  created_at: string
  id: number
  name1: string | null
  name2: string | null
  name3: string | null
  name4: string | null
  res_count1: number | null
  res_count2: number | null
  res_name1: string | null
  res_name2: string | null
}
