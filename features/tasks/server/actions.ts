"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  addSubtaskSchema,
  createTaskSchema,
  updateTaskSchema,
  toDbPriority,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/features/tasks/schema";
import { requireDbUserId } from "@/features/tasks/server/queries";
import { bumpTag } from "@/lib/cache-tags";

export async function createTask(input: CreateTaskInput) {
  const userId = await requireDbUserId();
  const data = createTaskSchema.parse(input);
  await db.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description ?? null,
      priority: toDbPriority(data.priority),
      dueDate: data.dueDate ?? null,
      tags: data.tags,
      projectId: data.projectId ?? null,
      status: "TODO",
    },
  });
  bumpTag("analytics", "tags");
  revalidatePath("/tasks");
}

export async function updateTask(input: UpdateTaskInput) {
  const userId = await requireDbUserId();
  const data = updateTaskSchema.parse(input);
  await db.task.update({
    where: { id: data.id, userId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.priority !== undefined
        ? { priority: toDbPriority(data.priority) }
        : {}),
      ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.projectId !== undefined
        ? { projectId: data.projectId }
        : {}),
    },
  });
  bumpTag("analytics", "tags");
  revalidatePath("/tasks");
}

export async function toggleTask(id: string, completed: boolean) {
  const userId = await requireDbUserId();
  await db.task.update({
    where: { id, userId },
    data: completed
      ? { status: "DONE", completedAt: new Date() }
      : { status: "TODO", completedAt: null },
  });
  bumpTag("analytics", "tags");
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  const userId = await requireDbUserId();
  await db.task.delete({ where: { id, userId } });
  bumpTag("analytics", "tags");
  revalidatePath("/tasks");
}

export async function addSubtask(input: { parentId: string; title: string }) {
  const userId = await requireDbUserId();
  const data = addSubtaskSchema.parse(input);
  // Confirm the parent belongs to the user before nesting under it.
  const parent = await db.task.findFirst({
    where: { id: data.parentId, userId },
    select: { id: true },
  });
  if (!parent) throw new Error("Parent task not found");
  await db.task.create({
    data: {
      userId,
      title: data.title.trim(),
      parentTaskId: parent.id,
      status: "TODO",
      priority: "MED",
    },
  });
  bumpTag("analytics", "tags");
  revalidatePath("/tasks");
}
