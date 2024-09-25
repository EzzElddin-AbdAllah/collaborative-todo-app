import { create } from "zustand";
import Todo from "@/types/Todo";

type TodoState = {
	todos: Todo[];
	setTodos: (todos: Todo[]) => void;
	addTodo: (todo: Todo) => void;
	updateTodo: (id: string, updatedTask: string) => void;
	deleteTodo: (id: string) => void;
};

export const useTodoStore = create<TodoState>((set) => ({
	todos: [],
	setTodos: (todos) => set({ todos }),
	addTodo: (todo) =>
		set((state) => ({
			todos: [...state.todos, todo],
		})),
	updateTodo: (id, updatedTask) =>
		set((state) => ({
			todos: state.todos.map((todo) =>
				todo.id === id ? { ...todo, task: updatedTask } : todo
			),
		})),
	deleteTodo: (id) =>
		set((state) => ({
			todos: state.todos.filter((todo) => todo.id !== id),
		})),
}));
