namespace Backend.DTOs.Ahorros
{
    public class CrearAhorroDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal MetaAhorro { get; set; }
        public decimal MontoActual { get; set; }
        public DateTime? FechaObjetivo { get; set; }
        public string? Descripcion { get; set; }
    }

    public class ObtenerAhorroDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal MetaAhorro { get; set; }
        public decimal MontoActual { get; set; }
        public decimal PorcentajeCompletado { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime? FechaObjetivo { get; set; }
        public string? Descripcion { get; set; }
    }
}