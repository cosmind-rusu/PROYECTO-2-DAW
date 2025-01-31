public class Suscripcion 
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; }
    public decimal Precio { get; set; }
    public string TipoServicio { get; set; } // Streaming, Música, Video, Otro
    public DateTime FechaInicio { get; set; }
    public bool Activa { get; set; }
    public string CicloCobro { get; set; } // Mensual, Anual, etc.
}