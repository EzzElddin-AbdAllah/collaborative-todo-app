"use client";

import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/auth";
import { useTodoStore } from "@/store/todo";
import Todo from "@/types/Todo";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Badge,
	Button,
	Card,
	Group,
	Paper,
	Stack,
	TextInput,
	Title,
} from "@mantine/core";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { z } from "zod";

const todoSchema = z.object({
	task: z.string().min(1, "Task is required"),
});

type TodoFormData = z.infer<typeof todoSchema>;

const TodoList = () => {
	const [editTask, setEditTask] = useState<{ id: string; task: string } | null>(
		null
	);
	const [user, setUser] = useState<{
		id: string;
		username: string;
		email: string;
	} | null>(null);
	const queryClient = useQueryClient();
	const setTodos = useTodoStore((state) => state.setTodos);
	const addTodoStore = useTodoStore((state) => state.addTodo);
	const updateTodoInStore = useTodoStore((state) => state.updateTodo);
	const deleteTodoFromStore = useTodoStore((state) => state.deleteTodo);

	const { todos } = useTodoStore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<TodoFormData>({
		resolver: zodResolver(todoSchema),
		mode: "onChange",
	});

	const {
		data: fetchedTodos,
		error,
		isLoading,
		isSuccess,
	} = useQuery({
		queryKey: ["todos"],
		queryFn: async () => {
			const { data } = await supabase.from("todos").select(`
					id,
					task,
					user_id,
					is_complete
				`);
			return data;
		},
	});

	useEffect(() => {
		if (isSuccess && fetchedTodos) setTodos(fetchedTodos);
	}, [fetchedTodos, isSuccess, setTodos]);

	// Real-time updates
	useEffect(() => {
		const subscription = supabase
			.channel("todos")
			.on(
				"postgres_changes",
				{ event: "*", schema: "public", table: "todos" },
				(payload: RealtimePostgresChangesPayload<Todo>) => {
					const { eventType, new: newTodo, old: oldTodo } = payload;
					if (eventType === "INSERT" && newTodo) {
						addTodoStore(newTodo); // Add new todo to the state
					}
					if (eventType === "UPDATE" && newTodo) {
						updateTodoInStore(newTodo.id, newTodo.task); // Update the existing todo
					}
					if (eventType === "DELETE" && oldTodo) {
						deleteTodoFromStore(oldTodo.id!); // Remove the deleted todo from state
					}
				}
			)
			.subscribe();

		// Cleanup subscription on component unmount
		return () => {
			subscription.unsubscribe();
		};
	}, [addTodoStore, updateTodoInStore, deleteTodoFromStore]);

	useEffect(() => {
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user) {
				const { id, email, user_metadata } = session.user;
				setUser({
					id,
					email: email || "",
					username:
						user_metadata?.display_name || user_metadata?.full_name || "",
				});
			} else {
				setUser(null);
			}
		};

		getSession();
	}, []);

	// Handle add task
	const handleAddTodo = async (data: TodoFormData) => {
		const optimisticTodo: Todo = {
			id: `${Date.now()}`,
			user_id: user?.id!,
			task: data.task,
			is_complete: false,
		};

		addTodoStore(optimisticTodo);
		reset();

		try {
			const { data: insertedTodo, error } = await supabase
				.from("todos")
				.insert([{ task: data.task, user_id: user?.id }])
				.select();

			if (error) {
				deleteTodoFromStore(optimisticTodo.id);
			} else {
				queryClient.invalidateQueries({ queryKey: ["todos"] });
				updateTodoInStore(optimisticTodo.id, insertedTodo![0].task);
			}
		} catch (err) {
			deleteTodoFromStore(optimisticTodo.id);
		}
	};

	// Modify handleEditTodo to include form submission
	const handleEditTodo = async () => {
		if (!editTask?.id || !editTask.task) return;

		// Optimistically update the todo in the UI
		const originalTask = todos?.find((todo) => todo.id === editTask.id)?.task;
		updateTodoInStore(editTask.id, editTask.task);

		try {
			// Update the todo in the database
			const { error } = await supabase
				.from("todos")
				.update({ task: editTask.task })
				.eq("id", editTask.id);

			if (error) {
				// Revert back if there was an error
				updateTodoInStore(editTask.id, originalTask!);
			} else {
				// Reset the edit state
				setEditTask(null);
				queryClient.invalidateQueries({ queryKey: ["todos"] });
			}
		} catch (err) {
			updateTodoInStore(editTask.id, originalTask!);
		}
	};

	// Handle delete task
	const handleDeleteTodo = async (id: string) => {
		const originalTodos = [...todos!];

		deleteTodoFromStore(id);

		try {
			const { error } = await supabase.from("todos").delete().eq("id", id);
			if (error) {
				setTodos(originalTodos);
			} else {
				queryClient.invalidateQueries({ queryKey: ["todos"] });
			}
		} catch (err) {
			setTodos(originalTodos);
		}
	};

	// Handle sign out
	const handleSignOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error: any) {
			console.error(error.message);
		}
	};

	if (error) return <p>Error loading todos</p>;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<Paper shadow="sm" radius="lg" withBorder className="w-full max-w-xl p-6">
				<Group className="mb-4">
					<Title order={3}>Welcome, {user?.username}</Title>
					<Button
						color="dark"
						onClick={handleSignOut}
						leftSection={<FaSignOutAlt />}
					>
						Sign Out
					</Button>
				</Group>

				<form
					onSubmit={editTask ? handleEditTodo : handleSubmit(handleAddTodo)}
					className="mb-6"
				>
					<Group align="flex-end">
						<TextInput
							placeholder={editTask ? "Edit task" : "What needs to be done?"}
							value={editTask ? editTask.task : undefined}
							{...register("task")}
							onChange={(e) =>
								setEditTask((prev) =>
									prev ? { ...prev, task: e.target.value } : null
								)
							} // Ensure `id` remains unchanged and `task` is updated
							error={errors.task?.message}
							className="w-full"
						/>

						<Button type="submit" color="teal" leftSection={<FaPlus />}>
							{editTask ? "Edit" : "Add"}
						</Button>
					</Group>
				</form>

				<Stack>
					{todos?.map((todo) => (
						<Card key={todo.id} shadow="sm" radius="md" withBorder>
							<Group align="center" justify="space-between">
								<div>
									<Title order={6}>{todo.task}</Title>
									<Badge color="gray" size="sm" className="mt-1">
										{todo.is_complete ? "Completed" : "Pending"}
									</Badge>
								</div>
								<Group>
									<Button
										size="xs"
										variant="outline"
										color="green"
										onClick={
											() => setEditTask({ id: todo.id, task: todo.task }) // Ensure both id and task are passed
										}
									>
										<FaEdit />
									</Button>

									<Button
										size="xs"
										variant="outline"
										color="red"
										onClick={() => handleDeleteTodo(todo.id)}
									>
										<FaTrash />
									</Button>
								</Group>
							</Group>
						</Card>
					))}
				</Stack>
			</Paper>
		</div>
	);
};

export default TodoList;
