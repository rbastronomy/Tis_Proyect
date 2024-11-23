/*==============================================================*/
/* DBMS name:      PostgreSQL 8                                 */
/* Created on:     09-11-2024 16:18:40                          */
/*==============================================================*/


drop index BOLETA_PK;

drop table BOLETA;

drop index GENERA3_FK;

drop index GENERA2_FK;

drop index GENERA_PK;

drop table GENERA;

drop index GESTIONA_FK;

drop index GESTIONA2_FK;

drop index GESTIONA_PK;

drop table GESTIONA;

drop index HISTORIAL_PK;

drop table HISTORIAL;

drop table PERMISO;

drop index PERSONA_PK;

drop table PERSONA;

drop table POSEE;

drop index TIENE_FK;

drop index RESERVA_PK;

drop table RESERVA;

drop index ASIGNA_FK;

drop table ROLES;

drop index APLICA_FK;

drop index SERVICIO_PK;

drop table SERVICIO;

drop index SOLICITA3_FK;

drop index SOLICITA_FK;

drop index SOLICITA2_FK;

drop index SOLICITA_PK;

drop table SOLICITA;

drop index CREA_FK;

drop index TARIFA_PK;

drop table TARIFA;

drop index ASIGNADO_FK;

drop index TAXI_PK;

drop table TAXI;

drop index VALORA2_FK;

drop index VALORA_FK;

drop index VALORA3_FK;

drop index VALORA_PK;

drop table VALORA;

drop index VALORACION_PK;

drop table VALORACION;

drop index VIAJE_PK;

drop table VIAJE;

/*==============================================================*/
/* Table: BOLETA                                                */
/*==============================================================*/
create table BOLETA (
   CODIGOBOLETA         INT4                 not null,
   TOTAL                FLOAT8               null,
   FEMISION             DATE                 null,
   METODOPAGO           CHAR(256)            null,
   DESCRIPCIONT         CHAR(256)            null,
   ESTADOB              CHAR(256)            null,
   DELETEDATBO          DATE                 null,
   constraint PK_BOLETA primary key (CODIGOBOLETA),
   constraint AK_FEMISIONBOLETA_BOLETA unique (FEMISION),
   constraint AK_ESTADOBOLETA_BOLETA unique (ESTADOB),
   constraint AK_METODOBOLETA_BOLETA unique (METODOPAGO)
);

/*==============================================================*/
/* Index: BOLETA_PK                                             */
/*==============================================================*/
create unique index BOLETA_PK on BOLETA (
CODIGOBOLETA
);

/*==============================================================*/
/* Table: GENERA                                                */
/*==============================================================*/
create table GENERA (
   CODIGO               INT4                 not null,
   CODIGORESERVA        INT4                 not null,
   CODIGOBOLETA         INT4                 not null,
   FECHAGENERADA        DATE                 null,
   constraint PK_GENERA primary key (CODIGO, CODIGORESERVA)
);

/*==============================================================*/
/* Index: GENERA_PK                                             */
/*==============================================================*/
create unique index GENERA_PK on GENERA (
CODIGO,
CODIGORESERVA
);

/*==============================================================*/
/* Index: GENERA2_FK                                            */
/*==============================================================*/
create  index GENERA2_FK on GENERA (
CODIGO
);

/*==============================================================*/
/* Index: GENERA3_FK                                            */
/*==============================================================*/
create  index GENERA3_FK on GENERA (
CODIGORESERVA
);

/*==============================================================*/
/* Table: GESTIONA                                              */
/*==============================================================*/
create table GESTIONA (
   ADM_RUT              INT4                 not null,
   RUT                  INT4                 not null,
   constraint PK_GESTIONA primary key (ADM_RUT, RUT)
);

/*==============================================================*/
/* Index: GESTIONA_PK                                           */
/*==============================================================*/
create unique index GESTIONA_PK on GESTIONA (
ADM_RUT,
RUT
);

/*==============================================================*/
/* Index: GESTIONA2_FK                                          */
/*==============================================================*/
create  index GESTIONA2_FK on GESTIONA (
RUT
);

/*==============================================================*/
/* Index: GESTIONA_FK                                           */
/*==============================================================*/
create  index GESTIONA_FK on GESTIONA (
ADM_RUT
);

/*==============================================================*/
/* Table: HISTORIAL                                             */
/*==============================================================*/
create table HISTORIAL (
   IDHISTORIAL          INT4                 not null,
   FCAMBIO              DATE                 null,
   ESTADOH              CHAR(256)            null,
   constraint PK_HISTORIAL primary key (IDHISTORIAL),
   constraint AK_FCAMBIO_HISTORIA unique (FCAMBIO),
   constraint AK_ESTADO_HISTORIA unique (ESTADOH)
);

/*==============================================================*/
/* Index: HISTORIAL_PK                                          */
/*==============================================================*/
create unique index HISTORIAL_PK on HISTORIAL (
IDHISTORIAL
);

/*==============================================================*/
/* Table: PERMISO                                               */
/*==============================================================*/
create table PERMISO (
   IDPERMISOS           INT4                 not null,
   NOMBREPERMISO        CHAR(256)            null,
   DESCRIPCIONPERMISO   CHAR(256)            null,
   FECHACREACION        DATE                 null,
   constraint AK_IDPERMISO_PERMISO unique (IDPERMISOS),
   constraint AK_NPERMISO_PERMISO unique (NOMBREPERMISO),
   constraint AK_FCPERMISO_PERMISO unique (FECHACREACION)
);

/*==============================================================*/
/* Table: PERSONA                                               */
/*==============================================================*/
create table PERSONA (
   RUT                  INT4                 not null,
   NOMBRE               CHAR(256)            null,
   APELLIDOP            CHAR(256)            null,
   APELLIDOM            CHAR(256)            null,
   FNACIMIENTO          DATE                 null,
   CORREO               CHAR(256)            null,
   NTELEFONO            INT4                 null,
   NACIONALIDAD         CHAR(256)            null,
   GENERO               CHAR(256)            null,
   ROL                  CHAR(256)            null,
   CONTRASENA           CHAR(256)            null,
   ESTADOP              CHAR(256)            null,
   FCONTRATACION        DATE                 null,
   LICENCIACONDUCIR     DATE                 null,
   ADM_FCONTRATACION    DATE                 null,
   CVIAJES              INT4                 null,
   constraint PK_PERSONA primary key (RUT),
   constraint AK_NOMBREPERSONA_PERSONA unique (NOMBRE),
   constraint AK_APELLIDOPPERSONA_PERSONA unique (APELLIDOP),
   constraint AK_APELLIDOMPERSONA_PERSONA unique (APELLIDOM),
   constraint AK_GENEROPERSONA_PERSONA unique (GENERO),
   constraint AK_ROLPERSONA_PERSONA unique (ROL),
   constraint AK_ESTADOPERSONA_PERSONA unique (ESTADOP)
);

/*==============================================================*/
/* Index: PERSONA_PK                                            */
/*==============================================================*/
create unique index PERSONA_PK on PERSONA (
RUT
);

/*==============================================================*/
/* Table: POSEE                                                 */
/*==============================================================*/
create table POSEE (
   IDPERMISOS           INT4                 null,
   IDROLES              INT4                 null,
   FCAMBIO              DATE                 null
);

/*==============================================================*/
/* Table: RESERVA                                               */
/*==============================================================*/
create table RESERVA (
   CODIGORESERVA        INT4                 not null,
   IDHISTORIAL          INT4                 null,
   ORIGENV              CHAR(256)            null,
   DESTINOV             CHAR(256)            null,
   FRESERVA             DATE                 null,
   FREALIZADO           DATE                 null,
   TIPO                 CHAR(256)            null,
   OBSERVACION          CHAR(256)            null,
   ESTADOS              CHAR(256)            null,
   DELETEDATRE          DATE                 null,
   constraint PK_RESERVA primary key (CODIGORESERVA),
   constraint AK_ORIGENRESERVA_RESERVA unique (ORIGENV),
   constraint AK_DESTINORESERVA_RESERVA unique (DESTINOV),
   constraint AK_FRESERVA_RESERVA unique (FRESERVA),
   constraint AK_FREALIZADORESERVA_RESERVA unique (FREALIZADO),
   constraint AK_ESTADORESERVA_RESERVA unique (ESTADOS)
);

/*==============================================================*/
/* Index: RESERVA_PK                                            */
/*==============================================================*/
create unique index RESERVA_PK on RESERVA (
CODIGORESERVA
);

/*==============================================================*/
/* Index: TIENE_FK                                              */
/*==============================================================*/
create  index TIENE_FK on RESERVA (
IDHISTORIAL
);

/*==============================================================*/
/* Table: ROLES                                                 */
/*==============================================================*/
create table ROLES (
   RUT                  INT4                 not null,
   IDROLES              INT4                 not null,
   NOMBREROL            CHAR(256)            null,
   DESCRIPCIONROL       CHAR(256)            null,
   FECHACREADAROL       DATE                 null,
   ESTADOROL            CHAR(256)            null,
   constraint AK_IDROL_ROLES unique (IDROLES),
   constraint AK_NOMBRER_ROLES unique (NOMBREROL),
   constraint AK_DESCRIPCIONR_ROLES unique (DESCRIPCIONROL),
   constraint AK_FCROL_ROLES unique (FECHACREADAROL)
);

/*==============================================================*/
/* Index: ASIGNA_FK                                             */
/*==============================================================*/
create  index ASIGNA_FK on ROLES (
RUT
);

/*==============================================================*/
/* Table: SERVICIO                                              */
/*==============================================================*/
create table SERVICIO (
   CODIGOS              INT4                 not null,
   ID                   INT4                 not null,
   TIPO                 CHAR(256)            null,
   DESCRIPCIONT         CHAR(256)            null,
   ESTADOS              CHAR(256)            null,
   DELETEATS            DATE                 null,
   constraint PK_SERVICIO primary key (CODIGOS),
   constraint AK_ESTADOSERVICIO_SERVICIO unique (ESTADOS),
   constraint AK_TIPOSERVICIO_SERVICIO unique (TIPO)
);

/*==============================================================*/
/* Index: SERVICIO_PK                                           */
/*==============================================================*/
create unique index SERVICIO_PK on SERVICIO (
CODIGOS
);

/*==============================================================*/
/* Index: APLICA_FK                                             */
/*==============================================================*/
create  index APLICA_FK on SERVICIO (
ID
);

/*==============================================================*/
/* Table: SOLICITA                                              */
/*==============================================================*/
create table SOLICITA (
   RUT                  INT4                 not null,
   CODIGORESERVA        INT4                 not null,
   CODIGOS              INT4                 not null,
   FECHASOLICITUD       DATE                 null,
   constraint PK_SOLICITA primary key (RUT, CODIGORESERVA, CODIGOS)
);

/*==============================================================*/
/* Index: SOLICITA_PK                                           */
/*==============================================================*/
create unique index SOLICITA_PK on SOLICITA (
RUT,
CODIGORESERVA,
CODIGOS
);

/*==============================================================*/
/* Index: SOLICITA2_FK                                          */
/*==============================================================*/
create  index SOLICITA2_FK on SOLICITA (
CODIGORESERVA
);

/*==============================================================*/
/* Index: SOLICITA_FK                                           */
/*==============================================================*/
create  index SOLICITA_FK on SOLICITA (
CODIGOS
);

/*==============================================================*/
/* Index: SOLICITA3_FK                                          */
/*==============================================================*/
create  index SOLICITA3_FK on SOLICITA (
RUT
);

/*==============================================================*/
/* Table: TARIFA                                                */
/*==============================================================*/
create table TARIFA (
   ID                   INT4                 not null,
   RUT                  INT4                 null,
   DESCRIPCIONT         CHAR(256)            null,
   PRECIO               FLOAT8               null,
   TIPO                 CHAR(256)            null,
   FCREADA              DATE                 null,
   ESTADOT              CHAR(256)            null,
   DELETEDATT           CHAR(256)            null,
   constraint PK_TARIFA primary key (ID),
   constraint AK_PRECIOTARFIA_TARIFA unique (PRECIO),
   constraint AK_TIPOTARFIA_TARIFA unique (TIPO),
   constraint AK_FCREADATARIFA_TARIFA unique (FCREADA),
   constraint AK_ESTADOTARFIA_TARIFA unique (ESTADOT)
);

/*==============================================================*/
/* Index: TARIFA_PK                                             */
/*==============================================================*/
create unique index TARIFA_PK on TARIFA (
ID
);

/*==============================================================*/
/* Index: CREA_FK                                               */
/*==============================================================*/
create  index CREA_FK on TARIFA (
RUT
);

/*==============================================================*/
/* Table: TAXI                                                  */
/*==============================================================*/
create table TAXI (
   PATENTE              CHAR(256)            not null,
   RUT                  INT4                 null,
   MODELO               CHAR(256)            null,
   MARCO                CHAR(256)            null,
   ANO                  FLOAT8               null,
   COLOR                CHAR(256)            null,
   REVISIONTECNICA      DATE                 null,
   PERMISOCIRCULACION   DATE                 null,
   CODIGOTAXI           INT4                 not null,
   ESTADOTX             CHAR(256)            null,
   DELETEDATTX          CHAR(256)            null,
   constraint PK_TAXI primary key (PATENTE),
   constraint AK_MODELOTAXI_TAXI unique (MODELO),
   constraint AK_ANOTAXI_TAXI unique (ANO),
   constraint AK_RTECNICATAXI_TAXI unique (REVISIONTECNICA),
   constraint AK_CODIGOTAXI_TAXI unique (CODIGOTAXI),
   constraint AK_ESTADOTAXI_TAXI unique (ESTADOTX)
);

/*==============================================================*/
/* Index: TAXI_PK                                               */
/*==============================================================*/
create unique index TAXI_PK on TAXI (
PATENTE
);

/*==============================================================*/
/* Index: ASIGNADO_FK                                           */
/*==============================================================*/
create  index ASIGNADO_FK on TAXI (
RUT
);

/*==============================================================*/
/* Table: VALORA                                                */
/*==============================================================*/
create table VALORA (
   RUT                  INT4                 not null,
   CODIGO               INT4                 not null,
   IDVALORACION         INT4                 not null,
   FECHAVALORACION      DATE                 null,
   constraint PK_VALORA primary key (RUT, CODIGO, IDVALORACION)
);

/*==============================================================*/
/* Index: VALORA_PK                                             */
/*==============================================================*/
create unique index VALORA_PK on VALORA (
RUT,
CODIGO,
IDVALORACION
);

/*==============================================================*/
/* Index: VALORA3_FK                                            */
/*==============================================================*/
create  index VALORA3_FK on VALORA (
CODIGO
);

/*==============================================================*/
/* Index: VALORA_FK                                             */
/*==============================================================*/
create  index VALORA_FK on VALORA (
IDVALORACION
);

/*==============================================================*/
/* Index: VALORA2_FK                                            */
/*==============================================================*/
create  index VALORA2_FK on VALORA (
RUT
);

/*==============================================================*/
/* Table: VALORACION                                            */
/*==============================================================*/
create table VALORACION (
   IDVALORACION         INT4                 not null,
   COMENTARIO           CHAR(256)            null,
   CALIFICACION         INT4                 null,
   FVALORACION          DATE                 null,
   ESTADOV              CHAR(256)            null,
   DELETEDATVJ          DATE                 null,
   constraint PK_VALORACION primary key (IDVALORACION),
   constraint AK_CALIFICACIONVALO_VALORACI unique (CALIFICACION),
   constraint AK_FECHAVALO_VALORACI unique (FVALORACION),
   constraint AK_ESTADOVALO_VALORACI unique (ESTADOV)
);

/*==============================================================*/
/* Index: VALORACION_PK                                         */
/*==============================================================*/
create unique index VALORACION_PK on VALORACION (
IDVALORACION
);

/*==============================================================*/
/* Table: VIAJE                                                 */
/*==============================================================*/
create table VIAJE (
   CODIGO               INT4                 not null,
   ORIGENV              CHAR(256)            null,
   DESTINOV             CHAR(256)            null,
   DURACION             FLOAT8               null,
   PASAJEROS            INT4                 null,
   OBSERVACION          CHAR(256)            null,
   ESTADOV              CHAR(256)            null,
   DELETEDATVJ          DATE                 null,
   constraint PK_VIAJE primary key (CODIGO),
   constraint AK_ORIGENVIAJE_VIAJE unique (ORIGENV),
   constraint AK_DESTINOVIAJE_VIAJE unique (DESTINOV),
   constraint AK_ESTADOVIAJE_VIAJE unique (ESTADOV)
);

/*==============================================================*/
/* Index: VIAJE_PK                                              */
/*==============================================================*/
create unique index VIAJE_PK on VIAJE (
CODIGO
);

alter table GENERA
   add constraint FK_GENERA_GENERA_BOLETA foreign key (CODIGOBOLETA)
      references BOLETA (CODIGOBOLETA)
      on delete restrict on update cascade;

alter table GENERA
   add constraint FK_GENERA_GENERA2_VIAJE foreign key (CODIGO)
      references VIAJE (CODIGO)
      on delete restrict on update cascade;

alter table GENERA
   add constraint FK_GENERA_GENERA3_RESERVA foreign key (CODIGORESERVA)
      references RESERVA (CODIGORESERVA)
      on delete restrict on update cascade;

alter table GESTIONA
   add constraint FK_GESTIONA_GESTIONA_PERSONA foreign key (ADM_RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table GESTIONA
   add constraint FK_GESTIONA_GESTIONA2_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table POSEE
   add constraint FK_POSEE_POSEE_PERMISO foreign key (IDPERMISOS)
      references PERMISO (IDPERMISOS)
      on delete restrict on update cascade;

alter table POSEE
   add constraint FK_POSEE_POSEE2_ROLES foreign key (IDROLES)
      references ROLES (IDROLES)
      on delete restrict on update cascade;

alter table RESERVA
   add constraint FK_RESERVA_TIENE_HISTORIA foreign key (IDHISTORIAL)
      references HISTORIAL (IDHISTORIAL)
      on delete restrict on update cascade;

alter table ROLES
   add constraint FK_ROLES_ASIGNA_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table SERVICIO
   add constraint FK_SERVICIO_APLICA_TARIFA foreign key (ID)
      references TARIFA (ID)
      on delete restrict on update cascade;

alter table SOLICITA
   add constraint FK_SOLICITA_SOLICITA_SERVICIO foreign key (CODIGOS)
      references SERVICIO (CODIGOS)
      on delete restrict on update cascade;

alter table SOLICITA
   add constraint FK_SOLICITA_SOLICITA2_RESERVA foreign key (CODIGORESERVA)
      references RESERVA (CODIGORESERVA)
      on delete restrict on update cascade;

alter table SOLICITA
   add constraint FK_SOLICITA_SOLICITA3_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table TARIFA
   add constraint FK_TARIFA_CREA_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table TAXI
   add constraint FK_TAXI_ASIGNADO_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table VALORA
   add constraint FK_VALORA_VALORA_VALORACI foreign key (IDVALORACION)
      references VALORACION (IDVALORACION)
      on delete restrict on update cascade;

alter table VALORA
   add constraint FK_VALORA_VALORA2_PERSONA foreign key (RUT)
      references PERSONA (RUT)
      on delete restrict on update cascade;

alter table VALORA
   add constraint FK_VALORA_VALORA3_VIAJE foreign key (CODIGO)
      references VIAJE (CODIGO)
      on delete restrict on update cascade;

