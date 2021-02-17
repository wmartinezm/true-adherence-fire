import { Component } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { TaskDialogResult, TaskDialogComponent } from './task-dialog/task-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  /*
  todo: Task[] = [
    {
      title: 'Buy milk',
      description: 'Go to the store and buy milk',
    },
    {
      title: 'Create a Kanban app',
      description: 'Using Firebase and Angular create a Kanban app!',
    },
  ];
  inProgress: Task[] = [];
  done: Task[] = [];
  */
 todo = this.store.collection<Task>('todo').valueChanges({ idField: 'id' });
 inProgress = this.store.collection<Task>('inProgress').valueChanges({ idField: 'id' });
 done = this.store.collection<Task>('done').valueChanges({ idField: 'id' });

  constructor(private dialog: MatDialog, private store: AngularFirestore) {}

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) => {
        if(result.task.title == null && result.task.description == null){
          return;
        }else{
          //this.todo.push(result.task);
          this.store.collection('todo').add(result.task);
        }
      });
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      //const dataList = this[list];
      //const taskIndex = dataList.indexOf(task);
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    this.store.firestore.runTransaction(() => Promise.all([
      this.store.collection(event.previousContainer.id).doc(event.previousContainer.data[event.previousIndex].id).delete(),
      this.store.collection(event.container.id).add(event.previousContainer.data[event.previousIndex])
    ]))
  //   const item = event.previousContainer.data[event.previousIndex];
  //   this.store.firestore.runTransaction(() => {
  //   const promise = Promise.all([
  //     this.store.collection(event.previousContainer.id).doc(item.id).delete(),
  //     this.store.collection(event.container.id).add(item),
  //   ]);
  //   return promise;
  // });
  //   transferArrayItem(
  //     event.previousContainer.data,
  //     event.container.data,
  //     event.previousIndex,
  //     event.currentIndex
  //   );
  }
}