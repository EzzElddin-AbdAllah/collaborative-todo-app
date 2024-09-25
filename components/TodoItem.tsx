import Todo from "@/types/Todo";

const TodoItem = ({
	todo,
	setEditTask,
	handleDeleteTodo,
}: {
	todo: Todo;
	setEditTask: (todo: { id: string; task: string }) => void;
	handleDeleteTodo: (id: string) => void;
}) => (
	<div className="flex justify-between items-center p-2 border-b">
		<span>{todo.task}</span>
		<div className="space-x-2">
			<button
				onClick={() => setEditTask({ id: todo.id, task: todo.task })}
				className="text-blue-500"
			>
				Edit
			</button>
			<button
				onClick={() => handleDeleteTodo(todo.id)}
				className="text-red-500"
			>
				Delete
			</button>
		</div>
	</div>
);
export default TodoItem;
