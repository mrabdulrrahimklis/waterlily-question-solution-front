import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { apiService } from "~/services/apiService";
import { useState } from "react";

export enum QuestionType {
  bullet = "bullet",
  answer = "answer",
  checkbox = "checkbox",
}

export default function CategoryProduct() {
  const { id } = useParams();
  const [presentData, setPresentData] = useState<{
    isVisible: boolean;
    answers: { answers: any[]; name: string } | null;
  }>({
    isVisible: false,
    answers: null,
  });

  const { register, handleSubmit, control, setValue, reset, watch } = useForm({
    defaultValues: {
      answers: [],
    },
  });

  const {
    data: answersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pool", id],
    queryFn: () => apiService.get(`/pool/${id}`),
  });

  const { mutate: submitAnswers } = useMutation({
    mutationFn: (data) => {
      return apiService.post("/pool/submit", {
        poolId: +id,
        ...data,
      });
    },
    onSuccess: () => {
      reset();
    },
    onError: (err) => console.error(err),
  });

  const onSubmit = (data: any) => {
    if (!answersData?.data?.questions?.length) return;

    const formattedAnswers = answersData.data.questions.map((q: any) => {
      const key = `question-${q.id}`;
      const userAnswer = watch(key);

      let value;

      if (q.type === QuestionType.checkbox) {
        value =
          q.answers
            ?.filter((ans: any) => userAnswer?.includes(String(ans.id)))
            .map((ans: any) => ans.content) ?? [];
      } else if (q.type === QuestionType.bullet) {
        const selected = q.answers?.find(
          (ans: any) => String(ans.id) === userAnswer
        );
        value = selected?.content ? [selected.content] : [];
      } else {
        value = userAnswer ? [userAnswer] : [];
      }

      return {
        questionId: q.id,
        question: q.content,
        type: q.type,
        value,
      };
    });

    const payload = {
      answers: formattedAnswers,
      name: answersData?.data?.name,
    };

    submitAnswers(payload);
    setPresentData({ isVisible: true, answers: payload });
  };

  if (isLoading) return <div className="text-center mt-4">Loading...</div>;
  if (isError || !answersData?.data?.questions?.length)
    return (
      <div className="text-center mt-4 text-red-500">There is no data.</div>
    );

  return (
    <>
      {presentData.isVisible ? (
        <>
          <h3 className="mx-12 text-2xl mt-8 my-2">
            {`Results for: ${presentData.answers?.name}`}
          </h3>

          {presentData.answers?.answers.map((value: any, index: number) => (
            <div
              key={index}
              className={cn([
                "py-4",
                index < presentData.answers.answers.length - 1
                  ? "border-b"
                  : "",
              ])}
            >
              <div className="mb-2 font-semibold">{value.question}</div>

              <div className="mb-2 font-semibold">
                {value.value.map((item: string, i: number) => (
                  <div key={i}>
                    {value.type === "checkbox" ? `${i + 1}.` : ""} {item}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            onClick={() =>
              setPresentData((prev) => ({
                ...prev,
                isVisible: false,
              }))
            }
          >
            See Questions
          </Button>
        </>
      ) : (
        <>
          <h3 className="mx-12 text-2xl mt-8 my-2">
            {answersData?.data?.name}
          </h3>

          <div className="mx-12 border p-6 mt-4 rounded-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              {answersData.data.questions.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className={cn([
                    "py-4",
                    index < answersData.data.questions.length - 1
                      ? "border-b"
                      : "",
                  ])}
                >
                  <div className="mb-2 font-semibold">{item.content}</div>

                  {item.type === QuestionType.bullet &&
                    Array.isArray(item.answers) && (
                      <Controller
                        control={control}
                        name={`question-${item.id}`}
                        render={({ field }) => (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col gap-2"
                          >
                            {item.answers.map((answer: any) => (
                              <div
                                key={answer.id}
                                className="flex items-center gap-2"
                              >
                                <RadioGroupItem
                                  value={String(answer.id)}
                                  className="w-4 h-4"
                                />
                                <Label>{answer.content}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                    )}

                  {item.type === QuestionType.checkbox &&
                    Array.isArray(item.answers) && (
                      <div className="flex flex-col gap-2">
                        {item.answers.map((answer: any) => {
                          const checkboxName = `question-${item.id}`;
                          const selectedValues = watch(checkboxName) || [];

                          const handleCheckboxChange = (checked: boolean) => {
                            const newValue = checked
                              ? [...selectedValues, String(answer.id)]
                              : selectedValues.filter(
                                  (val: string) => val !== String(answer.id)
                                );
                            setValue(checkboxName, newValue);
                          };

                          return (
                            <label
                              key={answer.id}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={selectedValues.includes(
                                  String(answer.id)
                                )}
                                onCheckedChange={handleCheckboxChange}
                                className="w-4 h-4"
                              />
                              <span>{answer.content}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                  {item.type === QuestionType.answer && (
                    <Input
                      placeholder="Your answer"
                      {...register(`question-${item.id}`)}
                    />
                  )}
                </div>
              ))}

              <Button type="submit" className="mt-4">
                Submit
              </Button>
            </form>
            {presentData.answers && (
              <Button
                className="mt-4"
                onClick={() =>
                  setPresentData((prev) => ({
                    ...prev,
                    isVisible: true,
                  }))
                }
              >
                See Answers
              </Button>
            )}
          </div>
        </>
      )}
    </>
  );
}
