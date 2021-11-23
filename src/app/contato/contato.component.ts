import { ContatoDetalheComponent } from './../contato-detalhe/contato-detalhe.component';
import { ContatoService } from './../contato.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contato } from './contato';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css'],
})
export class ContatoComponent implements OnInit {
  formulario: FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito'];

  totalElementos = 0;
  pagina = 0;
  tamanho = 10;
  pageSizeOptions: number[] = [10];

  constructor(
    private service: ContatoService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBat: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.montarFormulario();
    this.listarContatos(this.pagina, this.tamanho);
  }

  montarFormulario() {
    this.formulario = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
    });
  }

  listarContatos(pagina = 0, tamanho = 10) {
    this.service.list(pagina, tamanho).subscribe((response) => {
      this.contatos = response.content;
      this.totalElementos = response.totalElements;
      this.pagina = response.number;
    });
  }

  favoritar(contato: Contato) {
    this.service.favorito(contato).subscribe((response) => {
      contato.favorito = !contato.favorito;
    });
  }

  submit(): void {
    const formValues = this.formulario.value;
    const contato: Contato = new Contato(formValues.nome, formValues.email);
    this.service.save(contato).subscribe((response) => {
      // this.contatos.push(response); - Salva mas não atualiza na lista
      // Sem a paginação vai mostrar a foto, como a paginação não mostra
      // let lista: Contato[] = [...this.contatos, response];
      // this.contatos = lista;
      this.listarContatos();
      this.snackBat.open('Contato foi adicionado!', 'X', {
        duration: 2000,
      });
      this.formulario.reset();
    });
  }

  uploadFoto(event, contato) {
    const files = event.target.files;
    if (files) {
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append('foto', foto);
      this.service.upload(contato, formData).subscribe((response) => {
        this.listarContatos();
      });
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open(ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato,
    });
  }

  paginar(event: PageEvent) {
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho);
  }
}
