export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chapters: {
        Row: {
          created_at: string
          id: string
          song_id: string | null
          start_time: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id?: string | null
          start_time: number
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string | null
          start_time?: number
          title?: string
        }
      }
      choirs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
      }
      lyrics: {
        Row: {
          created_at: string
          end_time: number
          id: string
          song_id: string | null
          start_time: number
          text: string
        }
        Insert: {
          created_at?: string
          end_time: number
          id?: string
          song_id?: string | null
          start_time: number
          text: string
        }
        Update: {
          created_at?: string
          end_time?: number
          id?: string
          song_id?: string | null
          start_time?: number
          text?: string
        }
      }
      songs: {
        Row: {
          choir_id: string | null
          created_at: string
          html_content: string | null
          html_file_url: string | null
          id: string
          pdf_url: string | null
          title: string
        }
        Insert: {
          choir_id?: string | null
          created_at?: string
          html_content?: string | null
          html_file_url?: string | null
          id?: string
          pdf_url?: string | null
          title: string
        }
        Update: {
          choir_id?: string | null
          created_at?: string
          html_content?: string | null
          html_file_url?: string | null
          id?: string
          pdf_url?: string | null
          title?: string
        }
      }
      tracks: {
        Row: {
          created_at: string
          id: string
          song_id: string | null
          url: string
          voice_part: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id?: string | null
          url: string
          voice_part: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string | null
          url?: string
          voice_part?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]