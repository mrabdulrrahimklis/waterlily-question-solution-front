import { useMutation, useQuery } from "@tanstack/react-query";
import { ListChecks } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { apiService } from "~/services/apiService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const poolSchema = z.object({
  name: z.string().min(2, "Title is req"),
});

export default function Pool() {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const {
    data: poolsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pool"],
    queryFn: () => apiService.get("/pool"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(poolSchema),
  });

  const { mutate: createPool } = useMutation({
    mutationFn: (data: { name: string }) => apiService.post("/pool", data),
    onSuccess: () => {
      refetch();
      setIsOpenDialog(false);
      reset();
    },
    onError: (e) => {
      console.error(e);
    },
  });

  const sumitPool = (data) => {
    createPool(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mx-12">
      <div className="flex justify-between my-4">
        <div>
          <h3 className="font-bold text-3xl my-4">Pools</h3>
        </div>
        <div className="mt-4">
          <Dialog open={isOpenDialog}>
            <DialogTrigger>
              <Button onClick={() => setIsOpenDialog(true)}>Add Pool</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <div className=" my-4">Create pool form</div>
                </DialogTitle>
                <DialogDescription>
                  <form onSubmit={handleSubmit(sumitPool)}>
                    <div>
                      <div>
                        <Label htmlFor="name" className="flex flex-col">
                          <span className="text-left">Name of Pool</span>
                          <Input {...register("name")} />
                        </Label>
                      </div>
                      <div>
                        {errors.name && (
                          <div className="text-xs text-red-500">
                            {errors.name.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Button className="w-full mt-3" type="submit">
                        Create pool
                      </Button>
                    </div>
                  </form>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {poolsData?.data?.data?.length > 0 &&
        poolsData?.data?.data.map((item) => (
          <Link to={`pool/${item.id}`} key={item.id}>
            <Card className="w-full mt-4 hover:bg-gray-200">
              <CardContent className="flex items-center gap-4">
                <div>
                  <ListChecks size={32} />
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.questions?.length || 0} questions
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
    </div>
  );
}
