import { useMutation, useQuery } from "@tanstack/react-query";
import { ListChecks, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { apiService } from "~/services/apiService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const questionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["bullet", "answer", "checkbox"]),
  answers: z
    .array(
      z.object({
        content: z.string(),
        isCorrect: z.boolean().optional(),
      })
    )
    .optional(),
});

type QuestionTypeOfForm = z.infer<typeof questionSchema>;

export default function Pool() {
  const { id } = useParams();

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const {
    data: siglePoolData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pool"],
    queryFn: () => apiService.get(`/pool/${id}`),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      type: "answer",
      answers: [],
    },
    resolver: zodResolver(questionSchema),
  });

  const { mutate: createQuestion } = useMutation({
    mutationFn: (data: QuestionTypeOfForm) =>
      apiService.post("/question", {
        poolId: +id,
        ...data,
        answers: data.type === "answer" ? [] : data.answers,
      }),
    onSuccess: () => {
      refetch();
      setIsOpenDialog(false);
      reset();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { mutate: deleteQuestion } = useMutation({
    mutationFn: (id: number) => apiService.delete(`/question/${id}`),
    onSuccess: () => refetch(),
    onError: (error) => console.error(error),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answers",
  });

  const submitQuestion = (data) => {
    createQuestion(data);
  };

  const questionType = useWatch({ control, name: "type" });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mx-12">
      <div>
        <div>
          <div className="mt-4">
            <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
              <div className="border-b flex justify-between pb-2">
                <h3 className="font-bold text-3xl ">Pools</h3>
                <DialogTrigger asChild>
                  <Button variant="outline">Create Question</Button>
                </DialogTrigger>
              </div>
              <h3 className="font-extralight text-md my-1">
                Manage your pool questions
              </h3>
              <DialogContent className="sm:max-w-[425px]">
                <form
                  onSubmit={handleSubmit(submitQuestion)}
                  className="grid gap-4"
                >
                  <DialogHeader>
                    <DialogTitle>Create Question</DialogTitle>
                    <DialogDescription>
                      Add a new question to your pool.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col gap-2">
                    <Input
                      {...register("title")}
                      placeholder="Title"
                      className="w-full"
                    />
                    {errors.title && (
                      <div className="text-red-500 text-xs">
                        {errors.title.message}
                      </div>
                    )}

                    <Input
                      {...register("content")}
                      placeholder="Content"
                      className="w-full"
                    />
                    {errors.content && (
                      <div className="text-red-500 text-xs">
                        {errors.content.message}
                      </div>
                    )}

                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type of Question" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="answer">Answer</SelectItem>
                            <SelectItem value="bullet">Bullet</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <div className="text-red-500 text-xs">
                        {errors.type.message}
                      </div>
                    )}
                  </div>

                  {questionType !== "answer" && (
                    <div className="flex flex-col gap-2">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 mt-1"
                        >
                          <Input
                            className="w-full"
                            {...register(`answers.${index}.content`)}
                            placeholder={`Answer ${index + 1}`}
                          />
                          <input
                            type={
                              questionType === "bullet" ? "radio" : "checkbox"
                            }
                            onChange={() => {
                              if (questionType === "bullet") {
                                fields.forEach((_, i) =>
                                  setValue(
                                    `answers.${i}.isCorrect`,
                                    i === index
                                  )
                                );
                              } else {
                                const current = watch(
                                  `answers.${index}.isCorrect`
                                );
                                setValue(
                                  `answers.${index}.isCorrect`,
                                  !current
                                );
                              }
                            }}
                            checked={
                              watch(`answers.${index}.isCorrect`) || false
                            }
                            className="w-4 h-4"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={() =>
                          append({ content: "", isCorrect: false })
                        }
                        variant="secondary"
                        className="w-fit mt-2"
                      >
                        + Add Answer
                      </Button>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type="submit" className="w-full mt-2">
                      Create Question
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div>
        {siglePoolData?.data?.questions?.length > 0 ? (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="flex justify-end">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siglePoolData?.data?.questions.map((item) => (
                  <TableRow>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="flex justify-end">
                      <Button
                        onClick={() => deleteQuestion(item.id)}
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="mt-4 text-red-500"> There is no questions</div>
        )}
      </div>
    </div>
  );
}
