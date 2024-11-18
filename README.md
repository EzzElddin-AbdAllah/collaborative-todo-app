# Collaborative Todo List with Supabase Authentication

This project is a collaborative to-do list application built using **Next.js 14**, **Tailwind CSS**, **Mantine**, **Supabase**, **Zustand**, **React Hook Form**, and **Zod**. The app allows users to sign up or sign in using email/password or GitHub OAuth, create/edit/delete tasks, and see real-time updates across multiple users.
 
## Features

- **Sign Up/Sign In with Email and Password**.
- **GitHub OAuth authentication**.
- **Real-time collaborative to-do list**.
- **Optimistic UI updates** using Zustand for state management.
- **Form validation** using React Hook Form and Zod.
- Styled with **Mantine** and **Tailwind CSS**.

## Prerequisites

Before running this application, make sure you have the following installed on your system:

- **npm**
- **Supabase** account (to set up Supabase authentication and real-time database)

## Setup Instructions

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/EzzElddin-AbdAllah/collaborative-todo-app.git
cd collaborative-todo-app
```

### 2. Install Dependencies

Next, install the project dependencies using npm or yarn:

```bash
npm install
```

### 3. Supabase Setup

You need to set up a Supabase project for authentication and real-time database. Follow these steps:

#### Create a Supabase Project

1. Go to the Supabase website and create an account.

2. Create a new project and note down the Supabase URL and Supabase API Key.

#### Configure Authentication

1. Go to Authentication in your Supabase dashboard.

2. Enable Email and Password authentication.

3. Enable GitHub OAuth in the Providers tab. You will need to create a GitHub OAuth app in your GitHub settings and provide the Client ID and Client Secret in Supabase.

#### Database Setup

1. Go to the SQL Editor in Supabase.

2. Run the following SQL to create a todos table:

```sql
create table todos (
id uuid default uuid_generate_v4() primary key,
task text not null,
is_complete boolean default false,
inserted_at timestamp with time zone default now()
);
```

### 4. Create a .env File

In the root of the project, create a .env file and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the Application

Once you have set up Supabase and added your credentials, you can start the application:

```bash
npm run dev
```

The app will be running at http://localhost:3000.

### 6. Features Available

- You can sign up or sign in using email and password.
- Alternatively, you can sign in with GitHub.
- Once logged in, you can create, edit, and delete tasks in real-time. Other users will see updates immediately.

## Technologies Used

- Next.js 14: React framework for building server-rendered and statically generated websites.
- Supabase: Backend-as-a-Service for authentication, real-time database, and storage.
- Zustand: A small, fast, and scalable state-management solution.
- React Hook Form: Form handling and validation.
- Zod: Schema-based validation for form data.
- Mantine: UI components library for React.
- Tailwind CSS: Utility-first CSS framework for rapid UI development.
